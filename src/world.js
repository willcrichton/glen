/******************************************************
* world.js
* Contains World entity that is used to encapsulate all
* objects in a single canvas
******************************************************/

// Create a "World" object to hold all the fun things like cameras and scenes
Engine.World = function( args ){
	
	// Setup the canvas to draw on
	this.canvas = args.canvas || {
		height: window.innerHeight,
		width: window.innerWidth
	}
		
	// Setup the camera to look through
	this.camera = undefined;
	if(args.camera){
		if(args.camera.constructor.toString().indexOf("Array") == -1) 
			this.camera = args.camera
		else {
			this.camera = new THREE.Camera(
				args.camera.fov,
				args.camera.aspect,
				args.camera.near,
				args.camera.far
			);
		}
	} else {
		this.camera = new THREE.Camera( 60, this.canvas.width / this.canvas.height, 1, 10000 );
	}
	
	// Create a player entity for our main dude
	this.me = new Engine.Player( { object: this.camera } );
	
	// Setup the scene to place objects in
	this.scene = new THREE.Scene();
	
	// Create a renderer to draw the Scene in the canvas
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize( this.canvas.width, this.canvas.height );
	
	// Put the renderer in the DOM, assuming we have a container
	$(args.container || 'body').append( this.renderer.domElement );
		
	this.mouse = { x: 0, y: 0 };
	this.projector = new THREE.Projector();
	var w = this;
	$( this.renderer.domElement ).mousemove(function(e){
		e.preventDefault();
		w.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		w.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	});
	
	/* Current hooks:
		mousehover - Called every frame the mouse hovers over a mesh
		mouseover - Called once when mouseover, as opposed to every frame
		render - Called before the scene is rendered
		think - Called every frame
	*/
	this.hooks = {};
		
	// Helper variables
	
	// Array of all players (minus this.me)
	this.players = [];
	
	// see: think
	this.lastPosition = Vector();
	
	// Add this object to the master list
	insert(Engine.worlds,this);
}

Engine.World.prototype = {
	
	// Begin rendering the world -- you MUST call this in order to have anything happen
	startRender : function(){
	
		Engine.animateWorld( this );
		
	},
	
	// Basic wrapper function to add an entity to the scene
	addEntity : function( obj ){ 
	
		this.scene.addChild( obj );

	},
	
	addBlock : function( args ){
		
		var block = new THREE.CubeGeometry( args.width, args.height, args.depth, args.segmentsWidth, args.segmentsHeight, args.segmentsDepth, args.materials, args.flipped, args.sides );
		var material;
		if( args.matObj ) 
			material = args.matObj;
		else 
			material = new THREE.MeshFaceMaterial();
		var mesh = new THREE.Mesh( block, material );		
		mesh.position = args.pos || Vector(0,0,0);
		this.addEntity( mesh );
		
		// Testing collisions? (IN PROGRESS)
		THREE.Collisions.colliders.push( THREE.CollisionUtils.MeshOBB( mesh ) );
		
		return mesh;
	},
	
	// Add a basic sphere
	addSphere : function( args ){
	
		var sphere = new THREE.SphereGeometry( args.radius, args.segments, args.rings );
		var material;
		if( args.matObj ) 
			material = args.matObj;
		else 
			material = new THREE.MeshFaceMaterial();
		var mesh = new THREE.Mesh( sphere, material );
		mesh.position = args.pos || Vector(0,0,0);
		this.addEntity( mesh );
		
		THREE.Collisions.colliders.push( THREE.CollisionUtils.MeshOBB( mesh ) );
		
		return mesh;
	
	},
	
	// Add a point light
	addPointLight : function( pos, color ){
		
		var light = new THREE.PointLight( color || 0xFFFFFF );
		light.position = pos || Vector(0,0,0);
		this.scene.addLight( light );
	
	},
	
	// Add ambient light
	addAmbientLight : function( color ){
	
		var ambientLight = new THREE.AmbientLight( color || 0xFFFFFF );
		this.addEntity( ambientLight );

	},
	
	// Add a directional light
	addDirectionalLight : function( pos, color, intensity, distance ){
		
		var directionalLight = new THREE.DirectionalLight( color || 0xFFFFFF, intensity, distance );
		directionalLight.position = pos;
		directionalLight.position.normalize();
		this.addEntity( directionalLight );
		
	},
	
	// Load a JSON map file (IN PROGRESS)
	loadMap : function( file ){
	
		$.getJSON( file, function( data ){
			print_r(data);
		});
	
	},
	
	// Turn the existing world into a JSON string (IN PROGRESS)
	getMapString : function(){
	
		var map = {};
		map.entities = [ world.camera ];
		map.entities = map.entities.concat( world.scene.objects );
		
		for( i in map )
			console.log( i, map[i] );
			//map[i] = serialize( map[i] );
		
		return JSON.stringify( map );
	
	},
	
	// Set the skybox
	setSkybox : function( path, extension ){
		
		var urls = [
			path + 'px' + extension, path + 'nx' + extension,
			path + 'py' + extension, path + 'ny' + extension,
			path + 'pz' + extension, path + 'nz' + extension
		];
		
		var textureCube = THREE.ImageUtils.loadTextureCube( urls, new THREE.CubeRefractionMapping() );
		var shader = THREE.ShaderUtils.lib["cube"];
		shader.uniforms["tCube"].texture = textureCube;

		var material = new THREE.MeshShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms

		} ),

		mesh = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000, 1, 1, 1, null, true ), material );
		this.addEntity( mesh );
		
	},
	
	// Turn on fog
	enableFog : function( turnOn, color, density ){
		
		if( turnOn )
			this.scene.fog = new THREE.FogExp2( color || 0xFFFFFF, density || 0.00015 );
		else
			this.scene.fog = undefined;
	
	},
	
	addPlayer : function( args ){
		
		var newPlayer = new Engine.Player( args );
		var model = this.addBlock({
			width: 10, height: 10, depth: 10,
			matObj: new THREE.MeshPhongMaterial({
				color: 0x0000FF
			})
		});
		newPlayer.setObject( model );
		
		insert(this.players,newPlayer);
		
	},
	
	packetReceivedInternal : function( data ){
		
		try {
			var jsonarr = $.parseJSON( data.data );
			var type = jsonarr.PacketType;
			var arr = jsonarr.data;
			switch(type){
			
				case "load-players":
					for(var i = 0; i < arr.length; i++){
						if(arr[i].isMe)
							this.me.id = arr[i].id
						else
							this.addPlayer( arr[i] );
					}
					break;
					
				case "new-player":
					this.addPlayer( arr );
					break;
					
				case "remove-player":
					var index = -1;
					for(var i = 0; i < this.players.length; i++){
						if(this.players[i].id == arr.id){
							index = i; break;
						}
					}
					this.players.splice(index,1);
					break;
					
				case "position":
					var player = this.getPlayerByID(arr.id);
					if(player){
						player.setPos( Vector(arr.position) );
					}
					break;
					
				default:
					console.log('Invalid PacketType sent:',data.data);
					break;
					
			}
			
			this.callHook( 'packetReceived', jsonarr );
		} catch( e ){
			// Error handling for JSON parse fail here
			console.log(e,'Invalid packet:', data.data);
		}
	},
	
	thinkInternal : function(){
		
		// Send position updates to server
		if(this.me && !this.me.getPos().equals(this.lastPosition)){
			Engine.sendPacket(this.me.getPos().toString(),{ PacketType: 'position' });
			this.lastPosition = this.me.getPos().clone();
		}
		
		// Call mouseover event on cursor "collide" with mesh
		var vector = new THREE.Vector3( this.mouse.x, this.mouse.y, 0.5 );
		this.projector.unprojectVector( vector, this.camera );
		var ray = new THREE.Ray( this.camera.position, vector.subSelf( this.camera.position ).normalize() );
		var c = THREE.Collisions.rayCastNearest( ray );
		if( c ){
			this.callHook( 'mousehover', c );
			if( this.mouseOver && this.mouseOver != c.mesh )
				this.callHook( 'mouseover', c );
			this.mouseOver = c.mesh;
		}
		
		// Call other think hooks
		this.callHook( 'think', this );
		
	},
	
	getPlayerByID : function( id ){
		
		for(var i = 0; i < this.players.length; i++)
			if(this.players[i].id == id) 
				return this.players[i];
		return false;
		
	},
	
	addHook : function( hook, name, func ){
		
		if( this.hooks[hook] ){
			if( this.hooks[hook][name] )
				throw new Error('Hook of type "' + hook + '" and name "' + name + '" already exist.');
			else
				this.hooks[hook][name] = func;
		} else {
			this.hooks[hook] = {};
			this.addHook( hook, name, func );
		}
		
	},
	
	callHook : function( hook ){
		
		var args = Array.prototype.slice.call(arguments);
		args.splice( 0, 1 );
		if( this.hooks[hook] ){
			for( i in this.hooks[hook] ){
				this.hooks[hook][i].apply(this, args);
			}
		}
		
	}
	
}
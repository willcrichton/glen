/******************************************************
* world.js
* Contains World entity that is used to encapsulate all
* objects in a single canvas
******************************************************/

// Create a "World" object to hold all the fun things like cameras and scenes
Glen.World = function( args ){
	args = args || {};
	
	// Setup the canvas to draw on
	this.canvas = args.canvas || {
		height: window.innerHeight - 5,
		width: window.innerWidth
	}			
	
	// Setup the scene to place objects in
	this.scene = new Physijs.Scene;
	this.scene.setGravity({ x: 0, y: -20, z: 0 });

	// Create a renderer to draw the Scene in the canvas
	this.renderer = new THREE.WebGLRenderer({antialias:true});
	this.renderer.setSize( this.canvas.width, this.canvas.height );
	this.renderer.shadowMapEnabled = true;
	this.renderer.shadowMapSoft = true
	
	// Put the renderer in the DOM, assuming we have a container
	$(args.container || 'body').append( this.renderer.domElement );
	
	// Setup the camera to look through
	this.camera = undefined;
	if(args.camera){
		if(args.camera.constructor.toString().indexOf("Array") == -1) 
			this.camera = args.camera
		else {
			this.camera = new THREE.PerspectiveCamera(
				args.camera.fov,
				args.camera.aspect,
				args.camera.near,
				args.camera.far
			);
		}
	} else {
		this.camera = new THREE.PerspectiveCamera( 60, this.canvas.width / (this.canvas.height - 5), 1, 100000 );
	}
	this.camera.lookAt( this.scene.position );
	
	this.controls = new Glen.FPSControls( this.camera );
	this.controls.movementSpeed = 1000;
	this.controls.lookSpeed = 0.125;
	this.controls.lookVertical = true;
	this.controls.noFly = true;
	this.controls.constrainVertical = true;
	this.scene.add(this.camera);
	
	// Create a player entity for our main dude
	this.entities = [];
	this.players = [];
	this.me = new Glen.Entity( "player", { camera: this.camera, name: "Myself" } );
	this.players.push( this.me );
	this.entities.push( this.me );
	if( args.startPos ) 
		this.me.setPos( args.startPos )
	
	// Misc hooks (put these somewhere else?)
	this.mouse = { x: 0, y: 0, mouseX: 0, mouseY: 0 };
	this.projector = new THREE.Projector();
	var w = this;
	$( this.renderer.domElement ).mousemove(function(e){
		w.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		w.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		
		w.mouse.mouseX = event.clientX - window.innerWidth / 2;
		w.mouse.mouseY = event.clientY - window.innerHeight / 2;
	});
	
	// Replace this with vanilla javascript?
	$( document ).keypress(function(e){ w.callHook( 'KeyPress', e.which ) });
	/*var clickHook = function( singleClick ){
		var vector = new THREE.Vector3( w.mouse.x, w.mouse.y, 0.5 );
		w.projector.unprojectVector( vector, w.camera );
		var ray = new THREE.Ray( w.camera.position, vector.subSelf( w.camera.position ).normalize() );
		var c = THREE.Collisions.rayCastNearest( ray );
		if( c ){
			if( c.mesh.hasEntity() ){
				c.mesh.getEntity().callHook( singleClick ? 'Click' : 'DoubleClick', c.mesh.getEntity() );
			}
			w.callHook( singleClick ? 'Click' : 'DoubleClick', c.mesh.hasEntity() ? c.mesh.getEntity() : c.mesh );
		}
	}
	$( document ).click(function(e){ clickHook( true ) });
	$( document ).dblclick(function(e){ clickHook( false ) });*/
	
	if( args.skybox )
		this.setSkybox( args.skybox.path, args.skybox.extension );
		
	if( args.fog )
		this.enableFog( true, args.fog.color, args.fog.distance );
		
	if( args.fullscreen )
		this.requestFullScreen( true );
		
	/* Current global hooks:
		MouseHover - Called every frame the mouse hovers over a mesh
		MouseOver - Called once when mouseover, as opposed to every frame
		Render - Called before the scene is rendered
		Think - Called every frame
		KeyPress - called on key press
		Click - called on click entity
		DoubleClick - called on double click entity
		Move - called on player move
		
	   Current entity hooks:
		MouseHover
		MouseOver
		Think
		Click
		DoubleClick
	*/
	this.hooks = {};
		
	// see: think
	this.lastPosition = Vector();
	
	// Add this object to the master list
	Glen.worlds.push(this);
	
	if( args.autoStart !== false && args.autoStart !== 0 )
		this.startRender();
}

Glen.World.prototype = {
	
	// Begin rendering the world -- you MUST call this in order to have anything happen
	startRender : function(){
		Glen.renderWorld( this );
	},
	
	// Basic wrapper function to add an entity to the scene
	addEntity : function( obj ){ 
		var mesh;
		if( obj.isEntity ){
			mesh = obj.getMesh();
			var hasEnt = false;
			for( i in this.entities )
				if( this.entities[i] == obj ) hasEnt = true;
			if( !hasEnt )
				this.entities.push( obj )
		} else mesh = obj;
	
		for( i in this.scene.objects )
			if( this.scene.objects[i] === obj ) 
				return false;
			
		this.scene.add( mesh );
		return true;
	},
	
	removeEntity : function( obj ){
		if( !obj ) return;
		
		var mesh;
		if( obj.isEntity ){
			mesh = obj.getMesh();
			for( i in this.entities ){
				if( this.entities[i] == obj )
					this.entities.splice( i, 1 );
			}
		} else mesh = obj;
		
		this.scene.removeChildRecurse( mesh );
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

		var material = new THREE.ShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false

		} ),

		mesh = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000 ), material, 0 );
		mesh.flipSided = true;
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
		var newPlayer = new Glen.Entity( "player", args );	
		this.entities.push(newPlayer);
		this.players.push(newPlayer);
		
		return newPlayer;
	},
	
	packetReceivedInternal : function( data ){
		var jsonarr = $.parseJSON( data.data );
		var type = jsonarr.PacketType;
		
		console.log("Processing packet of type " + type);
		
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
				this.callHook( 'PlayerConnected', this.addPlayer( arr ) );
				console.log( 'Player "' + arr.id + '" has joined.' );
				break;
				
			case "remove-player":
				var index = -1;
				for(var i = 0; i < this.players.length; i++){
					if(this.players[i].id == arr.id){
						index = i; break;
					}
				}
				var player = this.players[index];
				this.players.splice(index,1);
				this.callHook( 'PlayerDisconnected', player )
				world.removeEntity(player);
				console.log( 'Player "' + arr.id + '" has left.' );
				break;
				
			case "position":
				var player = this.getPlayerByID(arr.id);
				if(player){
					player.setPos( Vector(arr.position) );
				}
				break;
				
			case "chat":
				console.log( arr.name + ' says "' + arr.message + '"' );
				break;
				
			case "error":
				console.log("Error: " + arr.error);
				break;
				
			default:
				console.log('Invalid PacketType ("' + type + '") received:',data.data);
				break;
				
		}
		
		this.callHook( 'packetReceived', jsonarr );
	},
	
	thinkInternal : function(){
		// Send position updates to server
		if(this.me && this.me.object && !this.me.getPos().equals(this.lastPosition)){
			Glen.sendPacket(this.me.getPos().toString(),{ PacketType: 'position' });
			this.lastPosition = this.me.getPos().clone();
		}
		
		// Call mouseover event on cursor "collide" with mesh
		/*var vector = new THREE.Vector3( this.mouse.x, this.mouse.y, 0.5 );
		this.projector.unprojectVector( vector, this.camera );
		var ray = new THREE.Ray( this.camera.position, vector.subSelf( this.camera.position ).normalize() );
		var c = THREE.Collisions.rayCastNearest( ray );
		if( c ){
			this.callHook( 'MouseHover', c );
			if( c.mesh.hasEntity() )
				c.mesh.getEntity().callHook( 'MouseHover', c );
			if( this.mouseOver && this.mouseOver != c.mesh ){
				this.callHook( 'MouseOver', c );
				if( c.mesh.hasEntity() )
					c.mesh.getEntity().callHook( 'MouseOver', c );
			}
			this.mouseOver = c.mesh;
		}*/
		
		// Call other think hooks
		this.callHook( 'Think', this );
		this.callHookOnEntities( 'Think', this );
	},
	
	getPlayerByID : function( id ){
		for(var i = 0; i < this.players.length; i++)
			if(this.players[i].id == id) 
				return this.players[i];
		return false;
	},
	
	addHook : function( hook, name, func ){
		this.hooks[hook] = this.hooks[hook] || [];
		if( typeof name == "function" ){
			this.hooks[hook].push( name );
		} else {
			if( this.hooks[hook][name] )
				throw new Error('Hook of type "' + hook + '" and name "' + name + '" already exist.');
			else
				this.hooks[hook][name] = func
		}
	},
	
	callHook : function( hook ){
		var args = Array.prototype.slice.call(arguments);
		args.splice( 0, 1 );
		if( typeof this.hooks[hook] != 'undefined' ){
			for( i in this.hooks[hook] ){
				this.hooks[hook][i].apply(this, args);
			}
		}
	},
	
	callHookOnEntities : function( hook ){
		for( i in this.entities )
			this.entities[i].callHook( hook );	
	},
	
	requestFullScreen: function( lockPointer, lockPointerCallback ){
		document.addEventListener( 'dblclick', function() {
			var el = document.documentElement,
			rfs = el.requestFullScreen
				|| el.webkitRequestFullScreen
				|| el.mozRequestFullScreen;
			rfs.call(el, Element.ALLOW_KEYBOARD_INPUT);
			el.ALLOW_KEYBOARD_INPUT = 1;
		});
		
		var self = this;
		document.addEventListener( 'webkitfullscreenchange', function(e) {
			self.canvas.width = window.innerWidth; self.canvas.height = window.innerHeight - 5;
			self.renderer.setSize( self.canvas.width, self.canvas.height );
			if (document.webkitIsFullScreen && lockPointer) {
				navigator.webkitPointer.lock(document.body, lockPointerCallback || function(){});
			}
		}, false);
	},
	
	setGravity: function( vector ){
		this.scene.setGravity( vector );
	}
}
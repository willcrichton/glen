/***************************************************
* entity.js
* Basic entity object as a wrapper for THREE Object3D
***************************************************/

// Takes three args: name, map of options, optional world to specifically add to
Engine.Entity = function( args ){	
		
	args = args || {};
		
	if( typeof args == "string" ){
		this.entType = args;
		argList = Array.prototype.slice.call(arguments);
		argList.splice( 0, 1 );
		args = argList[0];
		if( argList[1] )
			worldToAdd = argList[1];
			
		var ext = Engine.entityExtenders[this.entType];
		var funcQueue = [];
		while( ext ){
			funcQueue.push( ext );
			args = $.extend( ext.args, args  );
			ext = Engine.entityExtenders[ ext.extend ];
		}
		for( var i = funcQueue.length - 1; i >= 0; i-- ){
			var extension = funcQueue[i];
			Engine.entityList[ extension.extend ].call(this,args);
		}
		var retMesh = Engine.entityList[this.entType].call(this,args);
		if( retMesh )
			this.setMesh( retMesh );
	} 
		
	if( args.mesh )
		this.setMesh( args.mesh )
		
	this.isEntity = true;
	this.worlds = [];
	if( typeof worldToAdd != "undefined" ){
		worldToAdd.addEntity( this );
		this.worlds.push( worldToAdd );
	} else {
		for( i in Engine.worlds ) {
			var w = Engine.worlds[i];
			w.addEntity( this );
			this.worlds.push( w );
		}
	}
	return this;
	
}

Engine.Entity.prototype = {

	getType: function(){
		return this.entType || "entity"
	},
	
	getMesh: function(){
		return this.mesh;
	},
	
	setMesh: function( mesh ){
		this.mesh = mesh;
		mesh.entity = this;
	},
	
	getPos: function(){
		return this.getMesh().position.clone();
	},
	
	setPos: function( vector ){
		this.getMesh().position = vector.clone();
	},
	
	getRotation: function(){
		return this.getMesh().rotation.clone();
	},
	
	setRotation: function( vector ){
		this.getMesh().rotation = vector.clone()
	},
	
	rotate: function( vector ){
		this.setRotation( this.getRotation().addSelf(vector) )
	},
	
	getMaterial: function(){
		return this.getMesh().materials[0];
	},
	
	setMaterial: function(material){
		this.getMesh().materials[0] = material;
	},
	
	callHook: function( hook ){
		var args = Array.prototype.slice.call(arguments);
		args.splice( 0, 1 );
		if( this[hook] && typeof this[hook] == "function"){
			this[hook].apply(this, args);
		}
	},
	
	remove: function(){
		for( i in this.worlds ){
			this.worlds[i].removeEntity( this );
		}
	}
	
}

Engine.Entity.prototype.getObject = Engine.Entity.prototype.getMesh;
Engine.Entity.prototype.setObject = Engine.Entity.prototype.setMesh;

Engine.entityList = {};
Engine.entityExtenders = {};
Engine.registerEntity = function( name, func, extendEnt, args ){

	Engine.entityList[name] = func;
	if( extendEnt )
		Engine.entityExtenders[name] = {
			extend: extendEnt,
			args: args
		}
	
}

// Register additional entities

var playerEnt = function( args ){
		
	this.name = args.name || 'Minge Baggerson';
	this.id = args.id || '0';
	
	this.say = function( message ){
		Engine.sendPacket( message, { 
			PacketType: 'chat' 
		});
	}
	
}
Engine.registerEntity( "player", playerEnt );


var blockEnt = function( args ){

	var block = new THREE.CubeGeometry( args.width, args.height, args.depth, args.segmentsWidth, args.segmentsHeight, args.segmentsDepth, args.materials, args.flipped, args.sides );
	var material;
	if( args.material ) 
		material = args.material;
	else 
		material = new THREE.MeshFaceMaterial();
	var mesh = new THREE.Mesh( block, material );		
	mesh.position = args.pos || Vector(0,0,0);
	
	// Testing collisions? (IN PROGRESS)
	THREE.Collisions.colliders.push( THREE.CollisionUtils.MeshOBB( mesh ) );
	
	this.setMesh(mesh);
	
}
Engine.registerEntity( "block", blockEnt );


var sphereEnt = function( args ){

	var sphere = new THREE.SphereGeometry( args.radius, args.segments, args.rings );
	var material;
	if( args.material ) 
		material = args.material;
	else 
		material = new THREE.MeshFaceMaterial();
	var mesh = new THREE.Mesh( sphere, material );
	mesh.position = args.pos || Vector(0,0,0);
	
	THREE.Collisions.colliders.push( THREE.CollisionUtils.MeshOBB( mesh ) );
	
	this.setMesh(mesh);

}
Engine.registerEntity( "sphere", sphereEnt );


var planeEnt = function( args ){

	var plane = new THREE.PlaneGeometry( args.length, args.width );
	var material;
	if( args.material ) 
		material = args.material;
	else 
		material = new THREE.MeshFaceMaterial();
	var planeMesh = new THREE.Mesh(plane,material);
	planeMesh.position = args.pos || Vector(0,0,0);
	planeMesh.rotation = Vector(-1 * Math.PI / 2,0,0);
	
	return planeMesh;

}
Engine.registerEntity( "plane", planeEnt );


var textEnt = function( args ){

	var text = new THREE.TextGeometry( args.text, args );
	var material;
	if( args.material )
		material = args.material;
	else
		material = new THREE.MeshFaceMaterial();
	var mesh = new THREE.Mesh( text, material );
	mesh.position = args.pos || Vector();
	
	THREE.Collisions.colliders.push( THREE.CollisionUtils.MeshOBB( mesh ) );
	
	return mesh;
	
}
Engine.registerEntity( "text", textEnt );


var pointLightEnt = function( args ){

	var light = new THREE.PointLight( args.color || 0xFFFFFF );
	light.position = args.pos || Vector(0,0,0);
	light.intensity = args.intensity;
	
	return light;
	
}
Engine.registerEntity( "pointLight", pointLightEnt );


var directionalLightEnt = function( args ){

	var directionalLight = new THREE.DirectionalLight( args.color || 0xFFFFFF, args.intensity, args.distance );
	directionalLight.position = args.pos;
	directionalLight.position.normalize();
	
	return directionalLight;
	
}
Engine.registerEntity( "directionalLight", directionalLightEnt );


var ambientLightEnt = function( args ){
	
	var ambientLight = new THREE.AmbientLight( args.color || 0xFFFFFF );
	
	return ambientLight;
	
}
Engine.registerEntity( "ambientLight", ambientLightEnt );
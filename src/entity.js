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
		Engine.entityList[this.entType].call(this,args);
	} 
		
	if( args.mesh )
		this.mesh = args.mesh;
		
	this.isEntity = true;
	if( typeof worldToAdd != "undefined" )
		worldToAdd.addEntity( this );
			
	for( i in Engine.worlds )
		Engine.worlds[i].addEntity( this );
		
	return this;
	
}

Engine.Entity.prototype = {

	getPos: function(){
		if( this.mesh )
			return this.mesh.position;
	},
	
	setPos: function( vector ){
		if( this.mesh )
			this.mesh.position = vector.clone();
	},
	
	getObject: function(){
		return this.mesh;
	},
	
	getMesh: function(){
		return this.mesh
	},
	
	setObject: function( mesh ){
		this.mesh = mesh;
	},
	
	getType: function(){
		return this.entType || "entity"
	}
	
}

Engine.entityList = {};
Engine.registerEntity = function( name, func ){

	Engine.entityList[name] = func;
	
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
	
	this.mesh = mesh;
	
}
Engine.registerEntity( "block", blockEnt );


var sphereEnt = function( args ){

	var sphere = new THREE.SphereGeometry( args.radius, args.segments, args.rings );
	var material;
	if( args.matObj ) 
		material = args.material;
	else 
		material = new THREE.MeshFaceMaterial();
	var mesh = new THREE.Mesh( sphere, material );
	mesh.position = args.pos || Vector(0,0,0);
	
	THREE.Collisions.colliders.push( THREE.CollisionUtils.MeshOBB( mesh ) );
	
	this.mesh = mesh;

}
Engine.registerEntity( "sphere", sphereEnt );


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
	
	this.mesh = mesh;
	
}
Engine.registerEntity( "text", textEnt );


var pointLightEnt = function( args ){

	var light = new THREE.PointLight( args.color || 0xFFFFFF );
	light.position = args.pos || Vector(0,0,0);
	
	this.mesh = light;
	
}
Engine.registerEntity( "pointLight", pointLightEnt );


var directionalLightEnt = function( args ){

	var directionalLight = new THREE.DirectionalLight( args.color || 0xFFFFFF, args.intensity, args.distance );
	directionalLight.position = args.pos;
	directionalLight.position.normalize();
	
	this.mesh = directionalLight;
	
}
Engine.registerEntity( "directionalLight", directionalLightEnt );


var ambientLightEnt = function( args ){
	
	var ambientLight = new THREE.AmbientLight( args.color || 0xFFFFFF );
	
	this.mesh = ambientLight;
	
}
Engine.registerEntity( "ambientLight", ambientLightEnt );
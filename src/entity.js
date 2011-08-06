/***************************************************
* entity.js
* Basic entity object as a wrapper for THREE Object3D
***************************************************/

Engine.Entity = function( args ){	
	
	args = args || {};
	this.object = args.object
	
}

Engine.Entity.prototype = {}

Engine.Player = function( args ){

	Engine.Entity.call(this,args);
	
	this.name = args.name || 'Minge Baggerson';
	this.id = args.id || '0';
	
	this.say = function( message ){
		Engine.sendPacket( message, { 
			PacketType: 'chat' 
		});
	}
	
	this.getPos = function(){
		if( this.object )
			return this.object.position;
	}
	
	this.setPos = function( vector ){
		if( this.object )
			this.object.position = vector.copy();
	}
	
	this.setObject = function( obj ){
		this.object = obj;
	}
	
}

Engine.Player.prototype = new Engine.Entity();
Engine.Player.prototype.constructor = Engine.Player;
Engine.Player.prototype.supr = Engine.Entity
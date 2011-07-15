/**** entity.js* Basic entity object as a wrapper for THREE objects***/

ENGINE.Entity = function( args ){		
	this.object = args.object || undefined;		
}

ENGINE.Entity.prototype = {}
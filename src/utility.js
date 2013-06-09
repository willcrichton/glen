/******************************************************
* utility.js
* Holds a bunch of miscellaneous functions for various purposes
******************************************************/

// Cross-browser compatibility for requestAnimationFrame (used to update scene)
if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( callback, element ) {
			window.setTimeout( callback, 1000 / 60 );
		};
	} )();
}

// Vector3 toString function for debugging
THREE.Vector3.prototype.toString = function(){
	return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
}

THREE.Vector3.prototype.equals = function(vector){
	return (this.x == vector.x && this.y == vector.y && this.z == vector.z);
}

THREE.Object3D.prototype.hasEntity = function(){
	return typeof this.entity != "undefined";
}

THREE.Object3D.prototype.getEntity = function(){
	return this.entity;
}

/* PUT THIS IN A UTIL OBJECT? */

// Slightly shorter vector initialization
Glen.Vector = function(x,y,z){
	if(x == undefined)
		return new THREE.Vector3();
	else if(typeof x == "string"){
		var nums = x.replace(/[()\s]/gi,'').split(',');		
		return new THREE.Vector3(nums[0],nums[1],nums[2]);
	} else 
		return new THREE.Vector3(x,y,z);
}

Glen.VectorRandom = function(){
	return Vector(
		(Math.random() > 0.5 ? -1 : 1) * Math.random(),
		(Math.random() > 0.5 ? -1 : 1) * Math.random(),
		(Math.random() > 0.5 ? -1 : 1) * Math.random()
	);
}

// RGB to hex color function
Glen.Color = function(r,g,b){
	r = Math.floor(r); g = Math.floor(g); b = Math.floor(b);
	return parseInt(
		(r < 16 ? "0" : "") + r.toString(16) + 
		(g < 16 ? "0" : "") + g.toString(16) + 
		(b < 16 ? "0" : "") + b.toString(16)
	,16);
}

Glen.ColorRandom = function(){
	return Color(
		Math.floor(Math.random() * 255),
		Math.floor(Math.random() * 255), 
		Math.floor(Math.random() * 255)
	);
}

Glen.Material = function( path, args ) {
	args = args || {};
	var material = Physijs.createMaterial(
		new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture( path ), shading: THREE.FlatShading }),
		args.friction || .4,
		args.restitution || .6
	);
	material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
	material.map.repeat.set( args.repeatX || 2.5, args.repeatY || 2.5 );
	return material;
}

Glen.ColorMaterial = function( r, g, b, lambert, friction, restitution ){
	var color;
	if( typeof r != "number" ) 
		color = r;
	else
		color = Glen.Color( r, g, b );
	return new Physijs.createMaterial(
		lambert ? new THREE.MeshLambertMaterial({ color: color, shading: THREE.FlatShading }) : 
				  new THREE.MeshPhongMaterial({ color: color, shading: THREE.FlatShading }),
		friction || .4,
		restitution || .6);
}

Glen.loadModel = function( model, callback ){
	var loader = new THREE.JSONLoader();
	loader.load({ model: model, callback: callback });
}

Glen._timers = [];
Glen.createTimer = function( name, delay, reps, func ){
	var t = {
		delay: delay,
		reps: reps,
		active: false,
		func: func
	};
	this._timers[name] = t;
	this.runTimer( name );
}

Glen.singleTimer = function( delay, func ){
	var index = this.timers.push({
		reps: 1,
		delay: delay,
		active: false,
		func: func
	});
	this.runTimer( index -1 );
}

Glen.runTimer = function( name, runFunc ){
	var t = this._timers[name];
	if( t && t.reps >= 0 ){
		t.reps--;
		t.active = true;
		if( runFunc )
			t.func();
		var self = this;
		setTimeout(function(){
			self.tunTimer(name, true);
		}, t.delay);
	} else if( t ){
		t.active = false;
	}
}

Glen.removeTimer = function( name ){
	this._timers[name] = undefined;
}

var _mouseX = 0, _mouseY = 0, _projector = new THREE.Projector();
document.addEventListener('mousemove', function(event){
	_mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
	_mouseY = - ( event.clientY / window.innerHeight ) * 2 + 1;
})
Glen.mouseTrace = function(){
	var vector = new Glen.Vector( _mouseX, _mouseY, 1 );
	_projector.unprojectVector(vector, Glen._world.camera);

	var raycaster = new THREE.Raycaster(Glen._world.camera.position, vector.sub(Glen._world.camera.position).normalize());
	return raycaster.intersectObjects(Glen._world.scene.children)[0];
}

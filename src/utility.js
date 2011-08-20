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
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

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


// Equivalent to PHP's print_r
function print_r(theObj){
  if(theObj.constructor == Array ||
     theObj.constructor == Object){
    document.write("<ul>")
    for(var p in theObj){
	  if(theObj.hasOwnProperty(theObj[p])){
		  if(theObj[p].constructor == Array||
			 theObj[p].constructor == Object){
			document.write("<li>["+p+"] => "+typeof(theObj)+"</li>");
			document.write("<ul>")
			print_r(theObj[p]);
			document.write("</ul>")
		  } else {
	document.write("<li>["+p+"] => "+theObj[p]+"</li>");
		  }
	  }
    }
    document.write("</ul>")
  }
}

// Simple insert function
function insert( arr, obj ){
	arr.push( obj );
}

// Slightly shorter vector initialization
function Vector(x,y,z){
	if(x == undefined)
		return new THREE.Vector3();
	else if(typeof x == "string"){
		var nums = x.replace(/[()\s]/gi,'').split(',');		
		return new THREE.Vector3(nums[0],nums[1],nums[2]);
	} else 
		return new THREE.Vector3(x,y,z);
}

// RGB to hex color function
function Color(r,g,b){
	return parseInt(
		(r < 16 ? "0" : "") + r.toString(16) + 
		(g < 16 ? "0" : "") + g.toString(16) + 
		(b < 16 ? "0" : "") + b.toString(16)
	,16);
}

function ColorRandom(){
	return Color(Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
}

// Copy an object
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

// Make an object writable as JSON?
function serialize( obj ){
	obj.domElement = undefined;
	obj.parent = undefined;
	//var newObj = JSON.decycle( obj );
	var newObj = obj;
	for( i in newObj ){
		var type = typeof newObj[i];
		if( type == 'function' || newObj[i] == null ) newObj[i] = undefined;
	}
	return newObj;
}

/*THREE.FirstPersonCamera.prototype.translate = function( distance, axis ){
	this.matrix.rotateAxis( axis );

	axis.multiplyScalar( distance )

	this.position.addSelf( axis );
	this.target.position.addSelf( axis );
}*/
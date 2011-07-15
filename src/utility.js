/***
* utility.js
* Holds a bunch of miscellaneous functions for various purposes
***/

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
	arr.splice( arr.length, 0, obj );
}

// Slightly shorter vector initialization
function Vector(x,y,z){
	return new THREE.Vector3(x,y,z);
}

// RGB to hex color function
function Color(r,g,b){
	return parseInt(r.toString(16) + g.toString(16) + b.toString(16),16);
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
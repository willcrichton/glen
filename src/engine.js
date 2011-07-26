/***
* engine.js
* Contains ENGINE variable and initialization functions
***/

// Create the ENGINE array to store all functions
var ENGINE = ENGINE || {
	directory: 'engine/',
	include: [
		'lib/Three.js',
		'utility.js',
		'material.js',
		'entity.js',
		'render.js',
		'camera.js',
		'world.js'
	],
	status: 'Loading...'
};

ENGINE.loadScript = function( script ){
	
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = ENGINE.directory + ENGINE.include[index];
	$('head').append(script);
	
}

ENGINE.loadScripts = function( arr ){

	for( index in arr ){
		this.loadScript( arr[index] );
	}

}

ENGINE.loadBar = function(){
	
	$('body').append('<div class="loadBar"></div>');
	var bar = $('.loadBar');
	bar.progressbar({
		value: 32
	});
	
}

ENGINE.Initialize = function(){
		
	ENGINE.loadScripts( ENGINE.include );
	
}

/***
TO DO
- texture tiling (e.g. floor)

IDEA DUMP
- Map Loader (Hammer style, using JSON)
- Read /engine directory for files, don't put them in a stupid array
- First person camera that doesn't suck
- Multiplayer support (figure out WebSockets?)
***/
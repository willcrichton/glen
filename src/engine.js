/***
* engine.js
* Contains ENGINE variable and initialization functions
***/

// Create the ENGINE array to store all functions
var ENGINE = ENGINE || {
	directory: 'engine/',
	scripts: [
		'Three.js',
		'cycle.js',
		'utility.js',
		'material.js',
		'entity.js',
		'render.js',
		'camera.js',
		'world.js'
	]
};

// Load in all requisite scripts -- you MUST call this before doing absolutely anything else to get the engine started 
ENGINE.loadScripts = function(){

	for( index in ENGINE.scripts ){
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = ENGINE.directory + ENGINE.scripts[index];
		$('head').append(script);
	}

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
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

ENGINE.connectToServer = function( host ){

	host = host || 'ws://localhost/';
	try {
		ENGINE.socket = new WebSocket(host);
		ENGINE.socket.onopen = function(){
			console.log('Connection established.');
		}
		ENGINE.socket.onmessage = function(data){
			console.log(data.data);
		}
		ENGINE.socket.onclose = function(){
			console.log("Connection closing.");
		}
	}
	catch( e ) {
		console.log(e);
	}
	
}

ENGINE.loadBar = function( val ){
	
	if($('.loadBar').length == 0)
		$('body').append('<div class="loadBar"></div>');
		
	var bar = $('.loadBar');
	bar.progressbar({
		value: val || 0
	});
	
}

ENGINE.Initialize = function( debug ){
		
	if( debug ) console.log("Loading scripts...");
	ENGINE.loadScripts( ENGINE.include );
	ENGINE.connectToServer('ws://localhost:6994/3d/server.php');
	if( debug ) console.log("Establishing connection...");
	
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
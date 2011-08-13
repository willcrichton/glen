/******************************************************
* engine.js
* Contains Engine variable and initialization functions
******************************************************/

// Create the Engine array to store all functions
var Engine = Engine || {
	directory: 'engine/',
	include: [
		'lib/Three.js',
		'utility.js',
		'socket.js',
		'material.js',
		'entity.js',
		'render.js',
		'camera.js',
		'world.js'
	],
	status: 'Loading...',
	connected: false,
	players: [],
	worlds: []
};

Engine.loadScript = function( script ){
	
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src =this.directory + this.include[index];
	$('head').append(script);
	
}

Engine.loadScripts = function( arr ){

	for( index in arr ){
		this.loadScript( arr[index] );
	}

}

Engine.connectToServer = function( host ){

	host = host || 'ws://localhost/';
	try {
		this.socket = new WebSocket(host);
		this.socket.onopen = function(){
			console.log('Connection established.');
			Engine.connected = true;
		}
		this.socket.onmessage = function(data){
			for(var i = 0; i < Engine.worlds.length; i++){
				Engine.worlds[i].packetReceived( data );
			}
		}
		this.socket.onclose = function(){
			console.log("Connection closing.");
			Engine.connected = false;
		}
	}
	catch( e ) {
		console.log(e);
	}
	
}

Engine.loadBar = function( val ){
	
	if($('.loadBar').length == 0)
		$('body').append('<div class="loadBar"></div>');
		
	var bar = $('.loadBar');
	bar.progressbar({
		value: val || 0
	});
	
}

Engine.Initialize = function( debug ){
		
	this.connectToServer('ws://localhost:6967/3d/server.php');
	if( debug ) console.log("Establishing connection...");
	
}

/******************************************************************
TO DO
- texture tiling (e.g. floor)

IDEA DUMP
- Map Loader (Hammer style, using JSON)
- Read /engine directory for files, don't put them in a stupid array
- First person camera that doesn't suck
- Multiplayer support, including
	- player visibility
	- chatting
*****************************************************************`*/
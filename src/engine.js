/******************************************************
* engine.js
* Contains Engine variable and initialization functions
******************************************************/

/******************************************************************
TO DO
- Fix WebSockets... handshake won't work??
- Better integrate entities/players

IDEA DUMP
- Physics, collision, gravity
- Map Loader (Hammer style, using JSON)
- Multiplayer support, including
	- actual player models and updating
	- chatting
*****************************************************************`*/

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

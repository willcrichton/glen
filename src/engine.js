/******************************************************
* engine.js
* Contains Glen variable and initialization functions
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

Physijs.scripts.worker = 'engine/lib/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

// Create the Glen array to store all functions
var Glen = Glen || {
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

Glen.loadScript = function( script ){
	
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src =this.directory + this.include[index];
	$('head').append(script);
	
}

Glen.loadScripts = function( arr ){

	for( index in arr ){
		this.loadScript( arr[index] );
	}

}

Glen.connectToServer = function( host ){

	host = host || 'ws://localhost/';
	try {
		this.socket = new WebSocket(host);
		this.socket.onopen = function(){
			console.log('Connection established to ' + host);
			Glen.connected = true;
		}
		this.socket.onmessage = function(data){
			for(var i = 0; i < Glen.worlds.length; i++){
				Glen.worlds[i].packetReceivedInternal( data );
			}
		}
		this.socket.onclose = function(){
			console.log("Connection closing.");
			Glen.connected = false;
		}
	}
	catch( e ) {
		console.log(e);
	}
	
}

Glen.loadBar = function( val ){
	
	if($('.loadBar').length == 0)
		$('body').append('<div class="loadBar"></div>');
		
	var bar = $('.loadBar');
	bar.progressbar({
		value: val || 0
	});
	
}

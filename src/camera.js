/******************************************************
* camera.js
* A fail attempt at recreating an FPS camera.
* Needs "mouse locking" to work. Just use
* THREE.FirstPersonCamera, I guess.
******************************************************/

Glen.Camera = function( args ){
		
	THREE.FirstPersonCamera.call( this, args );
	
	this.lastX = 0;
	this.lastY = 0;
	this.xDiff = 0;
	this.yDiff = 0;
	this.mouseSensitivity = 3;
	this.useTarget = true;
	
	this.onMouseMove = function ( event ) {
		
		this.mouseX = event.clientX;
		this.mouseY = event.clientY;
		
		this.xDiff = this.mouseX - this.lastX;
		this.yDiff = this.mouseY - this.lastY;
		
		this.lastX = this.mouseX;
		this.lastY = this.mouseY;
	
	};
	
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	
	this.update = function(parentMatrixWorld, forceUpdate, camera){
				
		var now = new Date().getTime();
		this.tdiff = ( now - this.lastUpdate ) / 1000;
		this.lastUpdate = now;
		
		if ( !this.freeze ) {


			if ( this.heightSpeed ) {

				var y = clamp( this.position.y, this.heightMin, this.heightMax ),
					delta = y - this.heightMin;

				this.autoSpeedFactor = this.tdiff * ( delta * this.heightCoef );

			} else {

				this.autoSpeedFactor = 0.0;

			}

			var actualMoveSpeed = this.tdiff * this.movementSpeed;

			if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			if ( this.moveBackward ) this.translateZ( actualMoveSpeed );
			if ( this.moveLeft ) this.translateX( - actualMoveSpeed );
			if ( this.moveRight ) this.translateX( actualMoveSpeed );
		}
		
		this.lon += this.xDiff / this.mouseSensitivity;
		this.lat -= this.yDiff / this.mouseSensitivity;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = ( 90 - this.lat ) * Math.PI / 180;
		this.theta = this.lon * Math.PI / 180;

		var targetPosition = this.target.position,
			position = this.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta )
		
		this.xDiff = 0;
		this.yDiff = 0;
		
		this.supr.update.call(this);
			
	}
	
	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};
	
	function map_linear( x, sa, sb, ea, eb ) {

		return ( x  - sa ) * ( eb - ea ) / ( sb - sa ) + ea;

	};

	function clamp_bottom( x, a ) {

		return x < a ? a : x;

	};

	function clamp( x, a, b ) {

		return x < a ? a : ( x > b ? b : x );

	};

	
}

Glen.Camera.prototype = new THREE.FirstPersonCamera({fov:0,aspect:0,near:0,far:0});
Glen.Camera.prototype.constructor = Glen.Camera;
Glen.Camera.prototype.supr = THREE.Camera.prototype;
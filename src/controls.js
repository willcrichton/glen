/******************************************************
* camera.js
* A fail attempt at recreating an FPS camera.
* Needs "mouse locking" to work. Just use
* THREE.FirstPersonCamera, I guess.
******************************************************/

Glen.FPSControls = function( args ){
		
	THREE.FirstPersonControls.call( this, args );
	
	this.lastX = 0;
	this.lastY = 0;
	this.xDiff = 0;
	this.yDiff = 0;
	this.mouseSensitivity = 2;
	this.useTarget = true;	
	this.onMouseMove = function ( event ) {
	
		if ( this.domElement === document ) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}
		
		if(navigator.webkitPointer.isLocked){
			this.xDiff = event.webkitMovementX;
			this.yDiff = event.webkitMovementY;
		} else {
			this.xDiff = this.mouseX - this.lastX;
			this.yDiff = this.mouseY - this.lastY;
		
			this.lastX = this.mouseX;
			this.lastY = this.mouseY;
		}
	};

	
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	
	this.update = function( delta ) {
		var actualMoveSpeed = 0;
		
		if ( this.freeze ) {
			
			return;
			
		} else {

			if ( this.heightSpeed ) {

				var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
				var heightDelta = y - this.heightMin;

				this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

			} else {

				this.autoSpeedFactor = 0.0;

			}

			//actualMoveSpeed = delta * this.movementSpeed / 2;
			actualMoveSpeed = 0;
			
			if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
			if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

			if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
			if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

			if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
			if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

			var actualLookSpeed = delta * this.lookSpeed;

			if ( !this.activeLook ) {

				actualLookSpeed = 0;

			}
				
		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this.lon += this.xDiff / this.mouseSensitivity;
		this.lat -= this.yDiff / this.mouseSensitivity;
		//if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = ( 90 - this.lat ) * Math.PI / 180;

		this.theta = this.lon * Math.PI / 180;

		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.xDiff = 0;
		this.yDiff = 0;
		
		this.object.lookAt( targetPosition );

	};
	
	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

}

Glen.FPSControls.prototype = new THREE.FirstPersonControls();
Glen.FPSControls.prototype.constructor = Glen.FPSControls;
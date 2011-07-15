ENGINE.Camera = function( args ){

	THREE.FirstPersonCamera.call( this, args );
	
	/*this.update = function(){
	
		this.supr.update.call( this );
		
	}*/
	
}

ENGINE.Camera.prototype = new THREE.FirstPersonCamera();
ENGINE.Camera.prototype.constructor = ENGINE.Camera;
ENGINE.Camera.prototype.supr = THREE.FirstPersonCamera.prototype; 
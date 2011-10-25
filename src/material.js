Engine.loadTexture = function( path, repeat, opts ) {

	var image = new Image();
	image.onload = function () { 
		texture.needsUpdate = true;
		texture.repeat.x = repeat[0] / image.width * 16;
		texture.repeat.y = repeat[1] / image.height * 16;
	}
	image.src = path;

	var texture  = new THREE.Texture( image, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.LinearMipMapLinearFilter );
	
	return new THREE.MeshLambertMaterial( $.merge({ map: texture },opts || {}) );

}



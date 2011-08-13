Engine.loadTexture = function( path, repeat ) {

	var image = new Image();
	image.onload = function () { texture.needsUpdate = true; };
	image.src = path;

	var texture  = new THREE.Texture( image, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.LinearMipMapLinearFilter );
	
	texture.repeat.x = repeat[0] / image.width * 16;
	texture.repeat.y = repeat[1] / image.height * 16;

	return new THREE.MeshLambertMaterial( { map: texture } );

}

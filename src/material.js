Engine.loadTexture = function( path ) {

	var image = new Image();
	image.onload = function () { texture.needsUpdate = true; };
	image.src = path;

	var texture  = new THREE.Texture( image, new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.LinearMipMapLinearFilter );

	return new THREE.MeshLambertMaterial( { map: texture } );

}

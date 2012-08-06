Glen.Material = function( path, args ) {
	args = args || {};
	var material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( path ) }),
		args.friction || .8, 
		args.restitution || .4
	);
	material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
	material.map.repeat.set( args.repeatX || 2.5, args.repeatY || 2.5 );
	return material;
	
	/*var image = new Image();
	image.onload = function () { 
		texture.needsUpdate = true;
		texture.repeat.x = repeat[0] / image.width * 16;
		texture.repeat.y = repeat[1] / image.height * 16;
	}
	image.src = path;

	var texture  = new THREE.Texture( image, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.LinearMipMapLinearFilter );
	
	return new THREE.MeshLambertMaterial( $.merge({ map: texture },opts || {}) );*/
}



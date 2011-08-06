<!DOCTYPE html>
<html>
	<head>
		<title>WebGL Testing</title>
		
		<link href="styles/jquery-ui-1.8.14.custom.css" rel="stylesheet" type="text/css" />
		<link href="styles/style.css" rel="stylesheet" type="text/css" />
	</head>
	<body>
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
		<script src="engine/lib/jquery-ui-1.8.14.custom.min.js"></script>
		<script src='engine/lib/Three.js'></script>
		<script src="engine/engine.js"></script>
		<script src='engine/utility.js'></script>
		<script src='engine/socket.js'></script>
		<script src='engine/material.js'></script>
		<script src='engine/entity.js'></script>
		<script src='engine/render.js'></script>
		<script src='engine/camera.js'></script>
		<script src='engine/world.js'></script>
		<script>
			console.log("Initializing engine...");
			Engine.Initialize( true );

			jQuery(document).ready(init);
			
			var world;
			function init($){
				
				console.log('World loading...');
				world = new Engine.World({
					canvas: {
						height: window.innerHeight - 5,
						width: window.innerWidth 
					},
					container: 'body',
					camera: new THREE.FirstPersonCamera({
						fov: 45, aspect: (window.innerWidth ) / (window.innerHeight - 5), near: 1, far: 100000,
						movementSpeed: 250, lookSpeed: 0.125, noFly: true, constrainVertical: true
					})
				});
				
				world.me.setPos( Vector(100,30,100) );
				world.setSkybox('textures/cube/skybox/','.jpg');
				world.enableFog( true, 0xFFE9AD, 0.00025 );
				
				world.addSphere({
					pos: Vector(0,150,0),
					radius: 50, segments: 32, rings: 32,
					matObj: new THREE.MeshPhongMaterial({
						color: 0xFF0000
					})
				});
				
				world.addBlock({
					pos: Vector(0,50,0),
					width: 100, height: 100, depth: 100,
					matObj: new THREE.MeshPhongMaterial({
						color: 0x00FF00
					})
				});				

				var plane = new THREE.PlaneGeometry( 10000, 10000 );
				var grassTex = Engine.loadTexture( 'images/texture-grass.jpg' );
				var planeMesh = new THREE.Mesh(plane,grassTex);
				planeMesh.rotation = Vector(-1 * Math.PI / 2,0,0);
				world.addEntity( planeMesh );
				
				world.addAmbientLight( 0xCCCCCC );
				world.addDirectionalLight( Vector(1,1,0.5).normalize(), 0xFFFFFF, 1.5 );
				
				world.startRender();
				
			};
		</script>
	</body>
</html>
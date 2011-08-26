<!DOCTYPE html>
<html>
	<head>
		<title>WebGL Testing</title>
		
		<link href="styles/jquery-ui-1.8.14.custom.css" rel="stylesheet" type="text/css" />
		<link href="styles/style.css" rel="stylesheet" type="text/css" />
		
		<script> console.log("Loading libraries..."); </script>
		<script src='http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'></script>
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
		<script src="fonts/helvetiker_regular.typeface.js"></script>
		<script>			
			jQuery(document).ready(init);
			Engine.connectToServer('ws://localhost:6961/3d/server.php');
			
			var world;
			function init($){
				
				console.log('Loading world...');
				world = new Engine.World({
					canvas: {
						height: window.innerHeight - 5,
						width: window.innerWidth 
					},
					container: 'body',
					camera: new THREE.FirstPersonCamera({
						fov: 45, aspect: window.innerWidth / (window.innerHeight - 5), near: 1, far: 100000,
						movementSpeed: 250, lookSpeed: 0.125, noFly: true, constrainVertical: true
					}),
					skybox: {
						path: 'textures/cube/skybox/',
						extension: '.jpg'
					},
					position: Vector(100,30,100),
					fog: {
						color: 0xFFE9AD,
						distance: 0.00025
					}
				});
				
				world.camera.lat = Math.PI;
				world.camera.lon = Math.PI / 2;
				
				new Engine.Entity( "plane", {
					material: Engine.loadTexture( 'images/texture-grass3.jpg', [ 10000, 10000 ] ),
					width: 10000,
					length: 10000
				});
				
				var time = 0;
				world.addHook( 'Think', function(){ time++; });
				for(var rings = 1; rings <= 4; rings += 0.2){
					for(var i = 0; i < 20; i++){
						var blockMul = 360 / 20;
						var ringMul = 500 / rings;
						var b = new Engine.Entity( "block", {
							pos: Vector( 1500 + Math.cos(Math.PI / 180 * i * blockMul) * ringMul, 50 + Math.sin(Math.PI / 180 * i * blockMul) * ringMul, 500 + rings * 60  ),
							width: 20, height: 20, depth: 20,
							material: new THREE.MeshPhongMaterial({ color: 0xFFFFFF / rings })
						});
						b.iVal = i;
						b.blockMul = blockMul;
						b.ringMul = ringMul;
						b.Think = function(){
							var pos = this.getPos();
							pos.x = 1500 + Math.cos( Math.PI / 180 * (this.iVal * this.blockMul + time) ) * this.ringMul;
							pos.y = 500 + Math.sin( Math.PI / 180 * (this.iVal * this.blockMul + time) ) * this.ringMul;
							this.setPos( pos );
						}
					}
				}

				new Engine.Entity( "text", {
					text: "glengine",
					pos: Vector(-100,50, -100),
					curveSegments: 12,
					height: 10,
					material: new THREE.MeshPhongMaterial({ color: ColorRandom() })
				});
				
				new Engine.Entity("ambientLight",{color: 0xCCCCCC});
				new Engine.Entity("directionalLight",{
					pos: Vector(1,1,0.5).normalize(), 
					color: 0xFFFFFF, 
					intensity: 1.5
				});
				new Engine.Entity("pointLight",{pos: Vector(), color: 0xFFFFFF});
				
				world.startRender();
								
			};
		</script>
	</head>
	<body></body>
</html>
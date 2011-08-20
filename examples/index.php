<!DOCTYPE html>
<html>
	<head>
		<title>WebGL Testing</title>
		
		<link href="styles/jquery-ui-1.8.14.custom.css" rel="stylesheet" type="text/css" />
		<link href="styles/style.css" rel="stylesheet" type="text/css" />
		
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
		<script type="text/javascript" src="fonts/helvetiker_regular.typeface.js"></script>
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
				world.camera.lat = Math.PI;
				world.camera.lon = Math.PI / 2;
				world.setSkybox('textures/cube/skybox/','.jpg');
				world.enableFog( true, 0xFFE9AD, 0.00025 );
				
				var plane = new THREE.PlaneGeometry( 10000, 10000 );
				var grassTex = Engine.loadTexture( 'images/texture-grass3.jpg', [ 10000, 10000 ] );
				var planeMesh = new THREE.Mesh(plane,grassTex);
				planeMesh.rotation = Vector(-1 * Math.PI / 2,0,0);
				world.addEntity( planeMesh );	
				
				var blocks = [];
				for(var row = 0; row < 15; row++){
					for(var col = 0; col < 15; col++){
						var b = world.addBlock({
							pos: Vector(1000 + row * 105, 50 + Math.random() * 500, 1000 + col * 105),
							width: 100, height: 100, depth: 100,
							matObj: new THREE.MeshPhongMaterial({
								color: ColorRandom()
							})
						});
						b.rising = Math.random() > 0.5;
						blocks.push(b);
					}
				}
				
				world.addHook( 'mouseover', 'mouseOverTest', function( c ){
					c.mesh.materials[0].opacity = 0.5;
				});
				
				world.addHook( 'think', 'blockMoveTest', function(){
					for(i in blocks){
						var b = blocks[i];
						var pos = b.position;
						if(pos.y > 550){ b.rising = false; }
						else if(pos.y < 50){ b.rising = true; }
						b.position.y += (b.rising ? 1 : -1) * 5;
					}
				})
				
				world.addText({
					text: "glengine",
					pos: Vector(-100,50, 0),
					curveSegments: 12,
					height: 10,
					matObj: new THREE.MeshPhongMaterial({
						color: ColorRandom()
					})
				});
				
				world.addAmbientLight( 0xCCCCCC );
				world.addDirectionalLight( Vector(1,1,0.5).normalize(), 0xFFFFFF, 1.5 );
				world.addPointLight( Vector(), 0xFFFFFF );
				
				world.startRender();
				
			};
		</script>
	</head>
	<body></body>
</html>
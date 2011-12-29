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
		<script src='engine/world.js'></script>
		<script src="fonts/helvetiker_regular.typeface.js"></script>
		<script>			
			jQuery(document).ready(init);
			Glen.connectToServer('ws://localhost:6932/3d/server.php');
	
			var world;
			function init($){
				
				console.log('Loading world...');
				world = new Glen.World({
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
				
				new Glen.Entity( "plane", {
					material: Glen.loadTexture( 'images/texture-grass3.jpg', [ 10000, 10000 ] ),
					width: 10000,
					length: 10000
				});
				
				new Glen.Entity( "text", {
					text: "glengine",
					pos: Vector(-100,50, -100),
					curveSegments: 12,
					height: 10,
					material: new THREE.MeshPhongMaterial({ color: ColorRandom() })
				});
				
				new Glen.Entity("ambientLight",{color: 0xCCCCCC});
				new Glen.Entity("directionalLight",{
					pos: Vector(1,1,0.5).normalize(), 
					color: 0xFFFFFF, 
					intensity: 1.5
				});
			
				world.startRender();
								
			};
			
			function processChat(f){
				var val = $(f.chat).attr("value"), text = $('#chatText');
				var size = text.find('.chatMessage').size();
				if(size == 11)
					text.css('padding-right','10px');
				else if(size == 30)
					$(text.find('.chatMessage').get(0)).remove();
				text.append('<div class="chatMessage"><b>Will: </b>' + val + '</div>');
				return false;
			}
		</script>
	</head>
	<body>
		<div id="chatBox">
			<div id="chatText"></div>
			<form onsubmit="return processChat(this)">
				<input type="text" id="chatInput" name="chat" />
			</form>
		</div>
	</body>
</html>
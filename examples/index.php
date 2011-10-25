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
			//Engine.connectToServer('ws://localhost:6955/3d/server.php');
			
			function entDoor( args ){
				
				this.Open = false;
				this.isRotating = false;
								
				this.Click = function(){
					if( this.isRotating ) return;
					var rotMul = 0.55;
					var rotDelay = 0.05;
					var rotFrames = 100;
					if( this.Open ){
						var ent = this;
						var counter = 1;
						timer.Create( 'rotTimer', rotDelay, rotFrames, function(){
							counter++;
							ent.setRotation( Vector(0,Math.PI / 2 - Math.PI / 2 * counter / rotFrames,0) );
							var rot = Math.PI / 2 - Math.PI / 2 * counter / rotFrames
							ent.setPos( ent.getPos().addSelf(
								Vector( -Math.cos(rot) * rotMul, 0, Math.sin(rot) * rotMul ).multiplyScalar(-1)									
							) );
							ent.isRotating = counter -1 != rotFrames;
						});
						;
					} else {
						var ent = this;
						var counter = 1;
						timer.Create( 'rotTimer', rotDelay, rotFrames, function(){
							counter++;
							ent.setRotation( Vector(0,Math.PI / 2 * counter / rotFrames,0) );
							var rot = Math.PI / 2 * counter / rotFrames
							ent.setPos( ent.getPos().addSelf(
								Vector( -Math.cos(rot) * rotMul, 0, Math.sin(rot) * rotMul )									
							) );
							ent.isRotating = counter - 1 != rotFrames;
						});
						
					}
					this.Open = !this.Open;
				}
				
			}
			Engine.registerEntity( "door", entDoor, "block", { width: 10, height: 100, depth: 80 } );
			Engine.registerEntity( "blueDoor", function(){}, "door", { material: ColorMaterial(0,0,200) } );
			
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
							material: new THREE.MeshPhongMaterial({ color: Color( 255 * ( 1 - rings / 4 ), 255 * ( 1 - rings / 4 ), 255 * ( 1 - rings / 4 ) ) })
						});
						b.iVal = i;
						b.blockMul = blockMul;
						b.ringMul = ringMul;
						b.Think = function(){
							var pos = this.getPos();
							pos.x = 1500 + Math.cos( Math.PI / 180 * (this.iVal * this.blockMul + time) ) * this.ringMul;
							pos.y = 550 + Math.sin( Math.PI / 180 * (this.iVal * this.blockMul + time) ) * this.ringMul;
							this.setPos( pos );
						}
					}
				}
				
				var door = new Engine.Entity( "door", {
					pos: Vector(-100,50,100)
				});
				
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
				
				var loader = new THREE.JSONLoader();
				var guy = new Engine.Entity( "model", { model: "objects/Male02_slim.js" } );
				var mesh = guy.getMesh();
				mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.2;
	
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
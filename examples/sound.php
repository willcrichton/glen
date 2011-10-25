<!DOCTYPE html>
<html>
	<head>
		<title>Sound Testing</title>
		<style>
			* {
				padding: 0;
				margin: 0;
			}
			
			body {
				background: black;
			}
		</style>
	</head>
	<body>
		<script src='http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'></script>
		<script src='engine/lib/Three.js'></script>
		<script src="engine/engine.js"></script>
		<script src='engine/utility.js'></script>
		<script src='engine/socket.js'></script>
		<script src='engine/material.js'></script>
		<script src='engine/entity.js'></script>
		<script src='engine/render.js'></script>
		<script src='engine/world.js'></script>
		<script src="sound/beatdetektor.js"></script>
		<script src="sound/audio.js"></script>
		<script>
			var world, blocks;
			jQuery(document).ready(function($){
				
				world = new Engine.World({
					canvas: {
						height: window.innerHeight - 5,
						width: window.innerWidth 
					},
					container: 'body',
					position: Vector(0,500,2500),
				});
				
				var screenShake = Vector();
				world.addHook('Think',function(){
					this.camera.position.x += ( this.mouse.mouseX - this.camera.position.x ) * 0.05;
					this.camera.position.y += ( this.mouse.mouseY - this.camera.position.y ) * 0.05;
					
					var pos = Vector();
					this.camera.lookAt( pos.add(this.scene.position,screenShake) );
				});
				
				blocks = [];
				for( var i = 0; i < 48; i++ ){
					var b = new Engine.Entity("block",{
						width: 100, height: 100, depth: 100,
						material: ColorMaterial(Color(255 * (1 - i / 50),255 * i / 50,0)),
						pos: Vector(-100 * 25 + i * 100,-1000,0)
					});
					blocks.push(b);
				}

				new Engine.Entity("ambientLight",{color: 0xCCCCCC});
				new Engine.Entity("directionalLight",{
					pos: Vector(1,1,0.5).normalize(), 
					color: 0xFFFFFF, 
					intensity: 1.5
				});
				
				world.startRender();
				
				var processor = new AudioProcessor( "sound/stress.mp3" );
				var bgcolor = {r:0,g:0,b:0};
				processor.callback = function( freqByteData, kick, kickLevel ){
					if(kick && kickLevel > 0.47){
						//console.log("kick",kickLevel);
						bgcolor = {r:15,g:15,b:15};
						
						if( kickLevel > 0.62 ){
							var vec = VectorRandom().multiplyScalar(100);
							screenShake = vec.clone();
						}
						
					} else {
						bgcolor.r = Math.max(bgcolor.r-1,0);
						bgcolor.g = Math.max(bgcolor.g-1,0);
						bgcolor.b = Math.max(bgcolor.b-1,0);
						screenShake.x = screenShake.x > 0 ? Math.max(screenShake.x-5,0) : Math.min(screenShake.x+5,0);
						screenShake.y = screenShake.y > 0 ? Math.max(screenShake.y-5,0) : Math.min(screenShake.y+5,0);
						screenShake.z = screenShake.z > 0 ? Math.max(screenShake.z-5,0) : Math.min(screenShake.z+5,0);
					}
					$('body').css('background','rgb(' + bgcolor.r + ', ' + bgcolor.g + ', ' + bgcolor.b + ')');
					
					var box = 0;
					var width = 15;
					for( var i = 31; i <= 50 * width; i += width ){
						var avg = 0;
						for( var q = 0; q < width; q++ ) avg += freqByteData[i + q];
						var scale = 1 + avg / width * 0.08;
						var obj = blocks[box].getObject();
						obj.scale.y = scale;
						obj.position.y = scale * 50 - 1000;
						box++;
					}
				}
			});
		</script>
		
		<div id="container">
		
		</div>
	</body>
</html>
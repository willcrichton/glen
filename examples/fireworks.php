<!DOCTYPE html>
<html>
	<head>
		<title>WebGL Testing</title>
		
		<link href="styles/jquery-ui-1.8.14.custom.css" rel="stylesheet" type="text/css" />
		<link href="styles/style.css" rel="stylesheet" type="text/css" />
		
		<script> console.log("Loading libraries..."); </script>
		<script src='http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'></script>
		<script src='engine/lib/Three.js'></script>
		<script src="engine/engine.js"></script>
		<script src='engine/utility.js'></script>
		<script src='engine/socket.js'></script>
		<script src='engine/material.js'></script>
		<script src='engine/entity.js'></script>
		<script src='engine/render.js'></script>
		<script src='engine/world.js'></script>
		<script>			
			jQuery(document).ready(init);
			
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
						path: 'textures/cube/dark/',
						extension: '.jpg'
					},
					position: Vector(0,30,0)
				});
				
				world.camera.lat = Math.PI;
				world.camera.lon = Math.PI / 2;
				
				timer.Simple( 3000, function(){
					/*var streamPos = Vector(0,0,0);
					ringBurst( streamPos.y, 0x00FF00, 30, 5 );
					stream( streamPos, 5, 5000 );
					timer.Simple( 5000, function(){
						ringBurst( streamPos.y, 0x00FF00, 30, 5 );
					});*/
					
				});
				
				$(document).click(function(){
					splash( 0, 0x00FF00, 30, 5 );
				});
				
				sparkle( Vector( 0, 0, 20 ) );
				
				new Glen.Entity( "directionalLight", {
					pos: Vector(0,0,1).normalize(), 
					color: 0xFFFFFF, 
					intensity: 1.5
				});
				
				new Glen.Entity( "ambientLight", { color: 0xCCCCCC } );
	
				world.startRender();
								
			};		
			
			var particleID = 0;
			function fade( particle, time ){
				particleID++;
				particle.ID = particleID;
				timer.Create( "particle" + particleID, Math.round(time / 100), 100, function(){
					if( particle.materials[0].opacity <= 0.01 ){
						world.removeEntity( particle );
						timer.Remove( "particle" + particle.ID );
						delete particle;
					} else
						particle.materials[0].opacity -= 0.01;
				});
			}
			
			var tex = THREE.ImageUtils.loadTexture( "images/star.gif" );
			function ring( z, color, size, speed ){
		
				var particles = [];
				for( var p = 0; p < 120; p++ ){
					var geometry = new THREE.Geometry();
					geometry.vertices.push( new THREE.Vertex( Vector( Math.cos(p * 3) * size, z, Math.sin(p * 3) * size ) ) );
					var particle = new THREE.ParticleSystem( geometry, new THREE.ParticleBasicMaterial({
						color: color, size: 15, map: tex,
						blending: THREE.AdditiveBlending,
						transparent: true
					}) );
					particles.push(particle);
					world.addEntity( particle );
					fade( particle, 500 );
				}
				
				world.addHook( "Think", function(){
					for( i in particles ){
						var p = particles[i];
						p.position.addSelf( Vector( Math.cos(i * 3), 0, Math.sin(i * 3) ) );
					}
				});
			
			}
			
			function splash( z, color, size, speed ){
		
				var particles = [];
				for( var p = 0; p < 120; p++ ){
					var geometry = new THREE.Geometry();
					geometry.vertices.push( new THREE.Vertex( Vector( Math.cos(p * 3) * size, z, Math.sin(p * 3) * size ) ) );
					var particle = new THREE.ParticleSystem( geometry, new THREE.ParticleBasicMaterial({
						color: color, size: 15, map: tex,
						blending: THREE.AdditiveBlending,
						transparent: true
					}) );
					particles.push(particle);
					particle.geometry.__dirtyVertices = true;
					world.addEntity( particle );
					fade( particle, 500 );
				}
							
				var t = 0;
				world.addHook( "Think", function(){
					t += 0.06;
					for( i in particles ){
						var p = particles[i];
						p.position.addSelf( Vector( Math.cos(i * 3), (-t + 1), Math.sin(i * 3) ) );					
					}
				});
			
			}

			function stream( pos, speed, duration ){
				
				var flag = false;
				var material = new THREE.ParticleBasicMaterial({
					color: 0x00FF00, size: 15, map: tex,
					blending: THREE.AdditiveBlending,	
					transparent: true
				})
				timer.Simple( duration || 10000, function(){ flag = true; } );
				world.addHook( "Think", function(){
					if( flag ) return;
					pos.y += 1 * speed;
					var geometry = new THREE.Geometry();
					geometry.vertices.push( new THREE.Vertex( pos ) );
					var particle = new THREE.ParticleSystem( geometry, material  );
					particle.geometry.__dirtyVertices = true;
					world.addEntity( particle );
					fade( particle, 500 );
				});
				
			}
			
			function sparkle( pos ){
				
				
				var geometry = new THREE.Geometry();
				var material = new THREE.ParticleBasicMaterial({
					color: 0xFFFFAA, size: 10, map: tex,
					blending: THREE.AdditiveBlending,
					transparent: true
				})
				geometry.vertices.push( new THREE.Vertex( pos ) );
				
				var particleSystem = new THREE.ParticleSystem( geometry, material );
				world.addEntity( particleSystem );
				world.addHook( "Think", function(){
					var particle = new THREE.Vertex( pos );
					particle.dir = VectorRandom();
					geometry.vertices.push( particle );
					
					for( i in geometry.vertices ){
						var p = geometry.vertices[i];
						if( p && p.dir )
							p.position.addSelf( p.dir );
					}
					
					particleSystem.geometry.__dirtyVertices = true;
					//fade( particle, 2000 );
				});
				
				console.log( particleSystem, geometry );
				
			}
			
			
		</script>
	</head>
	<body>
	</body>
</html>
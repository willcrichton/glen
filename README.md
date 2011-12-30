# glen
* * *
### Purpose ###
GLEngine is a game-oriented javascript framework for developers using WebGL, aimed at providing features necessary to provide a better gaming experience on the web (and making it easy and intuitive to do). 

### Usage ###
First, include all the requisite files.  

```html
<script src='http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'></script>
<script src='engine/lib/Three.js'></script>
<script src="engine/engine.js"></script>
<script src='engine/utility.js'></script>
<script src='engine/socket.js'></script>
<script src='engine/material.js'></script>
<script src='engine/entity.js'></script>
<script src='engine/render.js'></script>
<script src='engine/world.js'></script>
```

Then, create a world and add some entities.

```html
<script>
	jQuery(document).ready(function(){
				
		// Make the sky light blue by setting background color
		document.body.style.background = 'lightBlue';
		
		// Create a new world object
		world = new Glen.World({
			position: Vector(100,30,100),							// player's starting position
			camera: new THREE.FirstPersonCamera({					// FirstPersonCamera looks around with mouse
				fov: 45, aspect: window.innerWidth / (window.innerHeight - 5), near: 1, far: 100000,
				movementSpeed: 250, lookSpeed: 0.125, noFly: true, constrainVertical: true
			}),
			fog: { color: Color(173,216,230), distance: 0.0015 }	// Add fog to make it look nice
		});
		
		// Add lighting so it's not black
		new Glen.Entity("ambientLight",{color: 0xCCCCCC});			
		new Glen.Entity("directionalLight",{
			pos: Vector(1,1,0.5).normalize(), 
			color: Color(255,255,255), 
			intensity: 1.5
		});
		
		// The floor (looks better with textures)
		new Glen.Entity( "plane", {
			material: ColorMaterial(0,50,0,true),
			width: 10000,
			length: 10000
		});
		
		// A block for reference
		new Glen.Entity( "block", {
			width: 100, height: 100, depth: 100,
			material: ColorMaterial(200,0,0)
		});
			
		// Start the rendering process
		world.startRender();
						
	});
</script>
```

### Features ###
Features include (or will soon include):  

* Intuitive setup (make a world, add entities)
* Convenient "entity" system
* "Hook" system to handle world-scale and entity-scale events
* Abstracting away most complicated rendering processes
* Useful utility functions (e.g. simple vectors, colors)

Planned features include (?):  

* Voice chat
* Map loading and creating
* FPS-style first person camera (...if mouse locking ever becomes available)
* Multiplayer support with WebSockets
* Basic physics - gravity, collision, movement

### Thanks ####
This framework relies heavily on mrdoob's [three.js](http://www.github.com/mrdoob/three.js) for all of the rendering grunt work. I couldn't have gotten this far without that wonderful script.
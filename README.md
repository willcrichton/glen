# glen

### Purpose ###
Glen (short for GL Engine) is a game-oriented framework for 3D application development aimed at fusing essential features for 3D games
with simple abstractions to make it easy to jump right into game development.

### Features ###
* Easy set up to get your world started
* Extensible system for managing objects in the world
* Support for both default and custom events (e.g. clicking an object)
* Integrated physics support
* Full screen support
* Mouse locking and FPS camera
* Multiplayer
     	 	

### [Demo](http://willcrichton.net/glen) ###
```
var world = new Glen.World({
    position: new THREE.Vector3(60, 50, 60),
    controls: true,
    fog: { color: 0xfeffd6 },
    fullscreen: true,
    skybox: { path: 'skybox/ '}
});

world.add(new THREE.AmbientLight(0x111111));

var light = new Glen.Entity.DirectionalLight({
    position: Glen.Util.Vector(-100, 50, 100),
    intensity: 1,
    color: 0xffffff
});
world.add(light);

var floor = new Glen.Entity.Floor({
    width: 100, depth: 100,
    material: Glen.Util.Material("images/grass.jpg",
              {friction: .8, restitution: .2, repeatX: 100, repeatY: 100}),
});
world.add(floor);

var block = new Glen.Entity.Block({
    width: 10, height: 10, depth: 10, mass: 100,
    material: Glen.Util.ColorMaterial({color: new THREE.Color(0xff0000)}),
    position: new THREE.Vector3(20, 20, 20)
});
world.add(block);

world.initialize();
```

### Thanks ####
This framework uses mrdoob's [three.js](http://www.github.com/mrdoob/three.js) for making rendering easy as well 
as Chandler Prall's awesome [physijs](https://github.com/chandlerprall/Physijs) for the physics engine.

# glen
* * *
### Purpose ###
Glengine is a game-oriented javascript framework for developers using WebGL, aimed at providing features essential for better gaming experience on the web. Glen abstracts the annoying chores of WebGL, allowing you to build your game as quickly as possible. Glengine builds upon [three.js](http://www.github.com/mrdoob/three.js), so Three developers are welcome as well!

### Features ###
* Easy set up to get your world started
* Extensible system for managing objects in the world
* Support for both default and custom events (e.g. clicking an object)
* Useful game features:
     - Built-in physics engine using [physijs](https://github.com/chandlerprall/Physijs)
	 - Fullscreen support 
	 - Mouse locking and actual first person camera

### Demo ###
```
<!DOCTYPE html>
<html>
<head>
    <script src="engine/jquery.min.js"></script>
    <script src="engine/three.min.js"></script>
    <script src="engine/physi.js"></script>
    <script src="engine/world.js"></script>  
    <script src="engine/utility.js"></script> 
    <script src="engine/controls.js"></script>
    <script src="engine/entity.js"></script>
    <style> * { padding: 0; margin: 0; }</style>   
</head>
<body>
    <script>
        var world = new Glen.World({
            position: Glen.Vector(60, 50, 60),
            skybox: { path: 'skybox/' }
        });

				var light = new Glen.Entity("directionalLight", {
					    position: Glen.Vector(20, 40, -15),
								  });

        var floor = new Glen.Entity("floor", {
            w: 100, d: 100, 
            material: Glen.Material("images/rocks.jpg", 
                                    {friction: .8, restitution: .4}),
        });

        var block = new Glen.Entity("block", {
            w: 10, h: 10, d: 10,
            color: Glen.Color(255, 0, 0),
            pos: Glen.Vector(0, 80, 0),
            rotation: Glen.Vector(Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2)
        });

        world.render();
    </script>
</body>
</html>
```

### Thanks ####
As previously mentioned, this framework relies heavily on mrdoob's lovely [three.js](http://www.github.com/mrdoob/three.js) for all of the rendering grunt work as well as Chandler Prall's awesome [physijs](https://github.com/chandlerprall/Physijs) for the physics engine.
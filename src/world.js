/****************************************
TODO:
- pointer lock for safari?
- websocket connection + player objects
- update physijs or find better physics engine (sad)
- make 1 or 2 cool demos
- explore Three library more
    - particles (fireworks demo?)
    - shaders
    - stats bar
    - POSTPROCESSING (this is easy shit)
- PhysiJS car demo
****************************************/

// presets for other scripts
Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

Glen = {};

Glen.World = function(args){
    args = args || {};
	
	// helper variables
    this._clock = new THREE.Clock();    // for updating FPS controls
    this._clock.start();
    this._entities = {};                // dict of all entities in the world
    this._eid = 0;                      // counter for entity IDs
    this._hooks = {};                   // dict of hooks to the world's events
    this._hovering = undefined;               // for the MouseOver hook
    Glen._world = this;                 // update current main world

    var self = this;


    // establish container element/size for renderer
    if(!args.container){
        this.container = document.body;
        this.canvasWidth = args.width || window.innerWidth;
        this.canvasHeight = args.height || window.innerHeight - 5;
    } else {
        this.container = args.container;
        this.canvasWidth = args.width || this.container.offsetWidth;
        this.canvasHeight = args.height || this.container.offsetHeight;
    }

    // create scene which contains the objects in our world
    // we use Physijs for the physics
    this.scene = new Physijs.Scene;
    this.scene.setGravity(args.gravity || Glen.Vector(0, -30, 0));

    // set up renderer for displaying scene in the canvas
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = true;
    this.renderer.setSize(this.canvasWidth, this.canvasHeight);
    this.container.appendChild(this.renderer.domElement);

    // create viewport for user to see into the canvas
    if(args.camera){
        if(args.camera.constructor.toString().indexOf("Array") == -1) 
            this.camera = args.camera
        else {
            this.camera = new THREE.PerspectiveCamera(
                args.camera.fov,
                args.camera.aspect,
                args.camera.near,
                args.camera.far
            );
        }
    } else {
        this.camera = new THREE.PerspectiveCamera( 60, this.canvasWidth / this.canvasHeight, 1, 100000 );
    }
    this.camera.position = args.position || Glen.Vector(0,0,0);

    // allow the user to control the camera
	if(args.controls){
		var controls = new Glen.FPSControls( this.camera );
		controls.movementSpeed = 100;
		controls.lookSpeed = 0.125;
		controls.lookVertical = true;
		controls.noFly = true;
		controls.constrainVertical = true;
		controls.constrainHorizontal = typeof args.constrainLook != "undefined" ? args.constrainLook : true;
		this.controls = controls;
	} else if(args.look) {
		var mouseX = 0, mouseY = 0;
		document.addEventListener('mousemove', function(event){
			mouseX = event.clientX - window.innerWidth / 2;
			mouseY = event.clientY - window.innerHeight / 2;
		}, false);
		
		this.addHook('Think', '_CameraUpdate', function(){
			var camera = this.camera;
			camera.position.x += ( mouseX - camera.position.x ) * 0.01;
			camera.position.y += ( - mouseY - camera.position.y ) * 0.01;
			camera.lookAt(this.scene.position);
		});
	}

    this.camera.lookAt(args.lookAt || this.scene.position);

    // begin rendering unless told otherwise
    if(args.autoStart) 
        this.render();

    if( args.skybox )
        this.setSkybox( args.skybox.path, args.skybox.ext );

    if( args.fog )
        this.setFog( args.fog.color, args.fog.distance );

    if( args.fullscreen ){
        var event = typeof args.fullscreen == "string" ? args.fullscreen : "dblclick";
        this.listenFullScreen(event);
    }
            
    // Set up Click hook
    document.addEventListener('click', function(){
        var ent = Glen.mouseTrace().object._entity;
        self.callHook('Click', ent);
        if(ent) ent.callHook('Click');
    });

    // Simple KeyPress hook
    document.addEventListener('keypress', function(e){
        self.callHook('KeyPress', e.which);  
    });
}

Glen.World.prototype = {
    render: function(){
        // requestAnimationFrame is some fancy shit we need to make the animation
        // smooth between frames, see three.js docs for reference
        var self = this;
        requestAnimationFrame(function(){ self.render(); });

        if(this.controls){
			this.controls.update(this._clock.getDelta());   // update controls
		}
        this.scene.simulate();                              // update physics
        this._think();                                      // run internal thinking
        this.renderer.render(this.scene, this.camera);      // draw the scene
        this.callHook('render');                            // render hooks
    },

    _think: function(){
        // do things on think
        var trace = Glen.mouseTrace();
        if(typeof trace != "undefined"
		   && typeof trace.object._entity != "undefined"){
			var hoverEnt = trace.object._entity;
            if(hoverEnt != this._hovering){
                world.callHook('MouseEnter', hoverEnt);
                hoverEnt.callHook('MouseEnter');
                this._hovering = hoverEnt;
            }
            world.callHook('MouseHover', hoverEnt);
            hoverEnt.callHook('MouseHover');
        } else {
            this._hovering = undefined;
        }

        this.callHook('Think', this);
        for(var i in this._entities) 
            this._entities[i].callHook('Think');
    },

    addHook: function(hook, name, callback){
        if(typeof this._hooks[hook] == "undefined") this._hooks[hook] = {};
        this._hooks[hook][name] = callback;
    },
    
    callHook: function( hook ){
        var args = Array.prototype.slice.call(arguments);
        args.splice( 0, 1 );
        if( this._hooks[hook] )
            for(i in this._hooks[hook])
                this._hooks[hook][i].apply(this, args);
    },

    removeHook: function(hook, name){
        if(!this._hooks[hook]) this._hooks[hook] = {};
        delete this._hooks[hook][name];
    },

    addEntity: function(ent){
        if(ent.entType){
            this.scene.add(ent.getMesh());
            ent._id = this._eid++;
            this._entities[ent.ID()] = ent;
        } else {
            this.scene.add(ent);
        }
    },

    removeEntity: function(obj){
        if(!obj) return;
        var mesh;
        if(obj.entType){
            mesh = obj.getMesh();
            delete this._entities[obj.ID()]
        } else {
            mesh = obj;
        }
        this.scene.removeChildRecurse(mesh);
    },

    listenFullScreen: function( event ){
        document.addEvenetListener(event, function() {
            var el = this.documentElement,
            rfs = el.requestFullScreen
                || el.webkitRequestFullScreen
                || el.mozRequestFullScreen;
            rfs.call(el, Element.ALLOW_KEYBOARD_INPUT);
            el.ALLOW_KEYBOARD_INPUT = 1;
        }, false);
        
        var self = this;
        document.addEventListener( 'webkitfullscreenchange', function(e) {
            // this is a hack. find out why window.inner(Width|Height) isn't updating in time
            setTimeout(function(){
                if(document.webkitIsFullScreen)
                    self.renderer.setSize( window.innerWidth, window.innerHeight );
                else
                    self.renderer.setSize( self.canvasWidth, self.canvasHeight );
            }, 100);
            if (document.webkitIsFullScreen && document.body.webkitRequestPointerLock) {
                document.body.webkitRequestPointerLock();
            }
        }, false);
    },

    setSkybox : function( path, extension ){
        var ext = ext || '.jpg';
        var urls = [
            path + 'px' + ext, path + 'nx' + ext,
            path + 'py' + ext, path + 'ny' + ext,
            path + 'pz' + ext, path + 'nz' + ext
        ];
        
        var textureCube = THREE.ImageUtils.loadTextureCube( urls, new THREE.CubeRefractionMapping() );
        var shader = THREE.ShaderLib["cube"];
        shader.uniforms["tCube"].value = textureCube;

        var material = new THREE.ShaderMaterial( {

            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide

        } );

        var mesh = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000 ), material );
        mesh.castShadow = false;
        mesh.name = "skybox";
        this.addEntity( mesh );
    },

    setFog : function( color, density ){
        if( color ){
            this.scene.fog = new THREE.FogExp2( color || 0xFFFFFF, density || 0.00015 );
            this._fog = this.scene.fog;
        } else {
            this.scene.fog = this._fog;
        }
    },

    removeFog : function(){
        this.scene.fog = undefined;
    }
}

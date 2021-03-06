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
    - postprocessing (DOF??)
- PhysiJS car demo
****************************************/

(function(){
    'use strict';

    Glen.World = function(args){
        args = args || {};
        
        // helper variables
        this._renderClock = new THREE.Clock();    // for updating FPS controls
        this._tickClock = new THREE.Clock();
        this._physicsClock = new THREE.Clock();

        this._hooks = {};                   // dict of hooks to the world's events
        this.tickDuration = 16;
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
        this.scene = new Physijs.Scene();
        this.scene.setGravity(args.gravity || new THREE.Vector3(0, -30, 0));
        this.scene.addEventListener('update', this._simulate.bind(this));

        // set up renderer for displaying scene in the canvas
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        this.container.appendChild(this.renderer.domElement);

        // create viewport for user to see into the canvas
        if(args.camera){
            if(args.camera.constructor.toString().indexOf("Array") == -1) 
                this.camera = args.camera;
            else {
                this.camera = new THREE.PerspectiveCamera(
                    args.camera.fov,
                    args.camera.aspect,
                    args.camera.near,
                    args.camera.far
                );
            }
        } else if(args.orthographic) {
            this.camera = new THREE.OrthographicCamera(
                window.innerWidth / -16, window.innerWidth / 16, 
                window.innerHeight / 16, window.innerHeight / -16,
                    -200, 100000);
        } else {
            this.camera = new THREE.PerspectiveCamera( 60, this.canvasWidth / this.canvasHeight, 1, 100000 );
        }
        this.camera.position = args.position || Glen.Vector(0,0,0);

        // use an effects composer to allow for postprocessing
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        this._fx = false;

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
            
            this.addHook('Tick', '_CameraUpdate', function(){
                var camera = this.camera;
                camera.position.x += ( mouseX - camera.position.x ) * 0.01;
                camera.position.y += ( - mouseY - camera.position.y ) * 0.01;
                camera.lookAt(this.scene.position);
            });
        }

        this.camera.lookAt(args.lookAt || this.scene.position);

        // begin rendering unless told otherwise
        this._running = false;
        if(args.autoStart === undefined || args.autoStart) { 
            this.initialize();
        }

        if( args.skybox ) {
            this.setSkybox( args.skybox.path, args.skybox.ext );
        }

        if( args.fog ) {
            this.setFog( args.fog.color, args.fog.distance );
        }

        if( args.fullscreen ){
            var event = typeof args.fullscreen == "string" ? args.fullscreen : "dblclick";
            this.listenFullScreen(event);
        }
        
        // Set up Click hook
        document.addEventListener('click', function(){
            var ent = Glen.Util.MouseTrace(self.camera);
            if (ent !== undefined) {
                ent = ent.object;
                self.callHook('Click', ent);
                if(ent) ent.callHook('Click');
            }
        });

        // Simple KeyPress hook
        document.addEventListener('keypress', function(e){
            self.callHook('KeyPress', e.which);  
        });
    };

    Glen.World.prototype = {

        /* 
         * Public API
         */

        initialize: function() {
            if (this._running) {
                return;
            }

            // start render loop
            requestAnimationFrame(this._render.bind(this));

            // start physics simulation
            this.scene.simulate();

            // start tick loop (for game logic)
            this._timerId = setInterval(this._tick.bind(this), this.tickDuration);

            // start clocks (to check deltas)
            this._renderClock.start();
            this._tickClock.start();
            this._physicsClock.start();

            this._running = true;
        },

        addHook: function(hook, name, callback){
            if(typeof this._hooks[hook] == "undefined") this._hooks[hook] = {};
            this._hooks[hook][name] = callback;
        },
        
        callHook: function( hook ){
            var args = Array.prototype.slice.call(arguments);
            args.splice( 0, 1 );
            var retval;
            if (this._hooks[hook]) {
                for (var i in this._hooks[hook]) {
                    var tmp = this._hooks[hook][i].apply(this, args);
                    if (typeof tmp != 'undefined' && typeof retval == 'undefined') {
                        retval = tmp;
                    }
                }   
            }
            return retval;
        },

        removeHook: function(hook, name){
            if(!this._hooks[hook]) this._hooks[hook] = {};
            delete this._hooks[hook][name];
        },

        add: function(ent){
            if(!ent) return;
            this.scene.add(ent);
        },

        remove: function(obj){
            if(!obj) return;
            this.scene.remove(obj);
        },

        listenFullScreen: function( event ){
            document.addEventListener(event, function() {
                var el = this.documentElement,
                rfs = el.requestFullScreen || 
                    el.webkitRequestFullScreen || 
                    el.mozRequestFullScreen;
                rfs.call(el, Element.ALLOW_KEYBOARD_INPUT);
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
            var shader = THREE.ShaderLib.cube;
            shader.uniforms.tCube.value = textureCube;

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
            this.add( mesh );
        },

        setFog : function( color, density ){
            if( color ){
                this.scene.fog = new THREE.FogExp2( color || 0xFFFFFF, density || 0.0003 );
                this.renderer.setClearColor(this.scene.fog.color, 1);
                this._fog = this.scene.fog;
            } else {
                this.scene.fog = this._fog;
            }
        },

        removeFog : function(){
            this.scene.fog = undefined;
        },

        addShaderEffect : function(args){
            var pass = new THREE.ShaderPass(args.shader);
            if(args.uniforms){
                for(var k in args.uniforms){
                    pass.uniforms[k].value = args.uniforms[k];
                }
            }
            this.composer.addPass(pass);
            this._fx = true;
            if(args.last){
                var copy = new THREE.ShaderPass(THREE.CopyShader);
                copy.renderToScreen = true;
                this.composer.addPass(copy);
            }
        },
        
        /*
         * Private functions
         */
        
        _render: function(){
            if(this._fx) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }

            if(this.controls){
                this.controls.update(this._renderClock.getDelta());   // update controls
            }

            this.callHook('Render');                            // render hooks

            requestAnimationFrame(this._render.bind(this));
        },

        _tick: function(){
            var trace = Glen.Util.MouseTrace(this.camera);
            if (trace !== undefined && 
               trace.object !== undefined) {
                var hoverEnt = trace.object;
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

            this.callHook('Tick', this._tickClock.getDelta());
            this.scene.traverse(function(e) {
                e.callHook('Tick');
            });
        },

        _simulate: function() {
            this.scene.simulate(undefined, 1);
            this.callHook('Simulate', this._physicsClock.getDelta());
        }
    };
})();

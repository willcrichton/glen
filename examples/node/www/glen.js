// presets for other scripts
var Glen = {};
(function(){
    'use strict';

    Physijs.scripts.worker = 'physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';
})();
/******************************************************
 * utility.js
 * Holds a bunch of miscellaneous functions for various purposes
 ******************************************************/

(function() {
    'use strict';
    // Cross-browser compatibility for requestAnimationFrame (used to update scene)
    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = ( function() {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( callback, element ) {
                    window.setTimeout( callback, 1000 / 60 );
                };
        } )();
    }

    // Vector3 toString function for debugging
    THREE.Vector3.prototype.toString = function(){
        return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
    };

    THREE.Vector3.prototype.equals = function(vector){
        return (this.x == vector.x && this.y == vector.y && this.z == vector.z);
    };

    Glen.Util = {

        // More convenient vector initialization
        Vector: function(x,y,z){
            if(x === undefined)
                return new THREE.Vector3();
            else if(typeof x == "string"){
                var nums = x.replace(/[()\s]/gi,'').split(',');         
                return new THREE.Vector3(nums[0],nums[1],nums[2]);
            } else 
                return new THREE.Vector3(x,y,z);
        },

        RandomVector: function(scale){
            return Glen.Util.Vector(
                scale * (Math.random() > 0.5 ? -1 : 1) * Math.random(),
                scale * (Math.random() > 0.5 ? -1 : 1) * Math.random(),
                scale * (Math.random() > 0.5 ? -1 : 1) * Math.random()
            );
        },

        Color: function(r, g, b) {
            r = Math.floor(r); g = Math.floor(g); b = Math.floor(b);
            return new THREE.Color(parseInt(
                (r < 16 ? "0" : "") + r.toString(16) +
                    (g < 16 ? "0" : "") + g.toString(16) +
                    (b < 16 ? "0" : "") + b.toString(16),
                16));
        },

        RandomColor: function(){
            return Glen.Util.Color(
                Math.floor(Math.random() * 255),
                Math.floor(Math.random() * 255), 
                Math.floor(Math.random() * 255)
            );
        },

        Material: function( path, args ) {
            args = args || {};
            var material = Physijs.createMaterial(
                new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture( path ), shading: THREE.FlatShading }),
                args.friction || 0.4,
                args.restitution || 0.6
            );
            material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
            material.map.repeat.set( args.repeatX || 2.5, args.repeatY || 2.5 );
            return material;
        },

        ColorMaterial: function( r, g, b, lambert, friction, restitution ){
            var color;
            if( typeof r != "number" ) 
                color = r;
            else
                color = new THREE.Color( r, g, b );
            return new Physijs.createMaterial(
                lambert ? new THREE.MeshLambertMaterial({ color: color, shading: THREE.FlatShading }) : 
                new THREE.MeshPhongMaterial({ color: color, shading: THREE.FlatShading }),
                friction || 0.4,
                restitution || 0.6);
        },

        loadModel: function( model, callback ){
            var loader = new THREE.JSONLoader();
            loader.load({ model: model, callback: callback });
        },

        _timers: [], 
        createTimer: function( name, delay, reps, func ){
            var t = {
                delay: delay,
                reps: reps,
                active: false,
                func: func
            };
            this._timers[name] = t;
            this.runTimer( name );
        },

        singleTimer: function( delay, func ){
            var index = this.timers.push({
                reps: 1,
                delay: delay,
                active: false,
                func: func
            });
            this.runTimer( index - 1 );
        },

        runTimer: function( name, runFunc ){
            var t = this._timers[name];
            if( t && t.reps >= 0 ){
                t.reps--;
                t.active = true;
                if( runFunc )
                    t.func();
                var self = this;
                setTimeout(function(){
                    self.tunTimer(name, true);
                }, t.delay);
            } else if( t ){
                t.active = false;
            }
        },

        removeTimer: function( name ){
            this._timers[name] = undefined;
        }
    };

    var 
    mouseX = 0, 
    mouseY = 0, 
    projector = new THREE.Projector(),
    raycaster = new THREE.Raycaster();
    document.addEventListener('mousemove', function(event){
        if (document.webkitPointerLockElement !== null) {
            mouseX = 0;
            mouseY = 0;
        } else {
            mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouseY = - ( event.clientY / window.innerHeight ) * 2 + 1;
        }
    });

    Glen.Util.MouseTrace = function(camera){
        var vector = new Glen.Util.Vector( mouseX, mouseY, 1 );
        projector.unprojectVector(vector, camera);

        raycaster.set(camera.position, vector.sub(camera.position).normalize());
        return raycaster.intersectObjects(Glen._world.scene.children)[0];
    };
})();
/**
 * @author alteredq / http://alteredqualia.com/
 */

(function(){
    'use strict';

    THREE.MaskPass = function ( scene, camera ) {

        this.scene = scene;
        this.camera = camera;

        this.enabled = true;
        this.clear = true;
        this.needsSwap = false;

        this.inverse = false;

    };

    THREE.MaskPass.prototype = {

        render: function ( renderer, writeBuffer, readBuffer, delta ) {

            var context = renderer.context;

            // don't update color or depth

            context.colorMask( false, false, false, false );
            context.depthMask( false );

            // set up stencil

            var writeValue, clearValue;

            if ( this.inverse ) {

                writeValue = 0;
                clearValue = 1;

            } else {

                writeValue = 1;
                clearValue = 0;

            }

            context.enable( context.STENCIL_TEST );
            context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
            context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
            context.clearStencil( clearValue );

            // draw into the stencil buffer

            renderer.render( this.scene, this.camera, readBuffer, this.clear );
            renderer.render( this.scene, this.camera, writeBuffer, this.clear );

            // re-enable update of color and depth

            context.colorMask( true, true, true, true );
            context.depthMask( true );

            // only render where stencil is set to 1

            context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
            context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

        }

    };


    THREE.ClearMaskPass = function () {

        this.enabled = true;

    };

    THREE.ClearMaskPass.prototype = {

        render: function ( renderer, writeBuffer, readBuffer, delta ) {

            var context = renderer.context;

            context.disable( context.STENCIL_TEST );

        }

    };


    /**
     * @author alteredq / http://alteredqualia.com/
     */

    THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

        this.scene = scene;
        this.camera = camera;

        this.overrideMaterial = overrideMaterial;

        this.clearColor = clearColor;
        this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

        this.oldClearColor = new THREE.Color();
        this.oldClearAlpha = 1;

        this.enabled = true;
        this.clear = true;
        this.needsSwap = false;

    };

    THREE.RenderPass.prototype = {

        render: function ( renderer, writeBuffer, readBuffer, delta ) {
            this.scene.overrideMaterial = this.overrideMaterial;

            if ( this.clearColor ) {

                this.oldClearColor.copy( renderer.getClearColor() );
                this.oldClearAlpha = renderer.getClearAlpha();

                renderer.setClearColor( this.clearColor, this.clearAlpha );

            }

            // renderer
            //renderer.render( this.scene, this.camera, readBuffer, this.clear );
            renderer.render(this.scene, this.camera, readBuffer, this.clear);

            if ( this.clearColor ) {

                renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

            }

            this.scene.overrideMaterial = null;

        }

    };


    /**
     * @author alteredq / http://alteredqualia.com/
     */

    THREE.ShaderPass = function ( shader, textureID ) {

        this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

        this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

        this.material = new THREE.ShaderMaterial( {

            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader

        } );

        this.renderToScreen = false;

        this.enabled = true;
        this.needsSwap = true;
        this.clear = false;

    };

    THREE.ShaderPass.prototype = {

        render: function ( renderer, writeBuffer, readBuffer, delta ) {

            if ( this.uniforms[ this.textureID ] ) {

                this.uniforms[ this.textureID ].value = readBuffer;

            }

            THREE.EffectComposer.quad.material = this.material;

            if ( this.renderToScreen ) {

                renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

            } else {

                renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, writeBuffer, this.clear );

            }

        }

    };


    /**
     * @author alteredq / http://alteredqualia.com/
     *
     * Full-screen textured quad shader
     */

    THREE.CopyShader = {

        uniforms: {

            "tDiffuse": { type: "t", value: null },
            "opacity":  { type: "f", value: 1.0 }

        },

        vertexShader: [

            "varying vec2 vUv;",

            "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform float opacity;",

            "uniform sampler2D tDiffuse;",

            "varying vec2 vUv;",

            "void main() {",

            "vec4 texel = texture2D( tDiffuse, vUv );",
            "gl_FragColor = opacity * texel;",

            "}"

        ].join("\n")

    };


    /**
     * @author alteredq / http://alteredqualia.com/
     */

    THREE.EffectComposer = function ( renderer, renderTarget ) {

        this.renderer = renderer;

        if ( renderTarget === undefined ) {

            var width = window.innerWidth || 1;
            var height = window.innerHeight || 1;
            var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

            renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

        }

        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

        this.passes = [];

        if ( THREE.CopyShader === undefined )
            console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

        this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

    };

    THREE.EffectComposer.prototype = {

        swapBuffers: function() {

            var tmp = this.readBuffer;
            this.readBuffer = this.writeBuffer;
            this.writeBuffer = tmp;

        },

        addPass: function ( pass ) {

            this.passes.push( pass );

        },

        insertPass: function ( pass, index ) {

            this.passes.splice( index, 0, pass );

        },

        render: function ( delta ) {

            this.writeBuffer = this.renderTarget1;
            this.readBuffer = this.renderTarget2;

            var maskActive = false;

            var pass, i, il = this.passes.length;

            for ( i = 0; i < il; i ++ ) {

                pass = this.passes[ i ];

                if ( !pass.enabled ) continue;

                pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

                if ( pass.needsSwap ) {

                    if ( maskActive ) {

                        var context = this.renderer.context;

                        context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

                        this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

                        context.stencilFunc( context.EQUAL, 1, 0xffffffff );

                    }

                    this.swapBuffers();

                }

                if ( pass instanceof THREE.MaskPass ) {

                    maskActive = true;

                } else if ( pass instanceof THREE.ClearMaskPass ) {

                    maskActive = false;

                }

            }

        },

        reset: function ( renderTarget ) {

            if ( renderTarget === undefined ) {

                renderTarget = this.renderTarget1.clone();

                renderTarget.width = window.innerWidth;
                renderTarget.height = window.innerHeight;

            }

            this.renderTarget1 = renderTarget;
            this.renderTarget2 = renderTarget.clone();

            this.writeBuffer = this.renderTarget1;
            this.readBuffer = this.renderTarget2;

        },

        setSize: function ( width, height ) {

            var renderTarget = this.renderTarget1.clone();

            renderTarget.width = width;
            renderTarget.height = height;

            this.reset( renderTarget );

        }

    };

    // shared ortho camera

    THREE.EffectComposer.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );

    THREE.EffectComposer.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );

    THREE.EffectComposer.scene = new THREE.Scene();
    THREE.EffectComposer.scene.add( THREE.EffectComposer.quad );
})();
/******************************************************
 * camera.js
 * A fail attempt at recreating an FPS camera.
 * Needs "mouse locking" to work. Just use
 * THREE.FirstPersonCamera, I guess.
 ******************************************************/

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

(function(){
    'use strict';

    THREE.FirstPersonControls = function ( object, domElement ) {

        this.object = object;
        this.target = new THREE.Vector3( 0, 0, 0 );

        this.domElement = ( domElement !== undefined ) ? domElement : document;

        this.movementSpeed = 1.0;
        this.lookSpeed = 0.005;

        this.lookVertical = true;
        this.autoForward = false;
        // this.invertVertical = false;

        this.activeLook = true;

        this.heightSpeed = false;
        this.heightCoef = 1.0;
        this.heightMin = 0.0;
        this.heightMax = 1.0;

        this.constrainVertical = false;
        this.verticalMin = 0;
        this.verticalMax = Math.PI;

        this.autoSpeedFactor = 0.0;

        this.mouseX = 0;
        this.mouseY = 0;

        this.lat = 0;
        this.lon = 0;
        this.phi = 0;
        this.theta = 0;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.freeze = false;

        this.mouseDragOn = false;

        this.viewHalfX = 0;
        this.viewHalfY = 0;

        if ( this.domElement !== document ) {

            this.domElement.setAttribute( 'tabindex', -1 );

        }

        //

        this.handleResize = function () {

            if ( this.domElement === document ) {

                this.viewHalfX = window.innerWidth / 2;
                this.viewHalfY = window.innerHeight / 2;

            } else {

                this.viewHalfX = this.domElement.offsetWidth / 2;
                this.viewHalfY = this.domElement.offsetHeight / 2;

            }

        };

        this.onMouseDown = function ( event ) {

            if ( this.domElement !== document ) {

                this.domElement.focus();

            }

            event.preventDefault();
            event.stopPropagation();

            if ( this.activeLook ) {

                switch ( event.button ) {

                case 0: this.moveForward = true; break;
                case 2: this.moveBackward = true; break;

                }

            }

            this.mouseDragOn = true;

        };

        this.onMouseUp = function ( event ) {

            event.preventDefault();
            event.stopPropagation();

            if ( this.activeLook ) {

                switch ( event.button ) {

                case 0: this.moveForward = false; break;
                case 2: this.moveBackward = false; break;

                }

            }

            this.mouseDragOn = false;

        };

        this.onMouseMove = function ( event ) {

            if ( this.domElement === document ) {

                this.mouseX = event.pageX - this.viewHalfX;
                this.mouseY = event.pageY - this.viewHalfY;

            } else {

                this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
                this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

            }

        };

        this.onKeyDown = function ( event ) {

            //event.preventDefault();

            switch ( event.keyCode ) {

            case 38: /*up*/
            case 87: /*W*/ this.moveForward = true; break;

            case 37: /*left*/
            case 65: /*A*/ this.moveLeft = true; break;

            case 40: /*down*/
            case 83: /*S*/ this.moveBackward = true; break;

            case 39: /*right*/
            case 68: /*D*/ this.moveRight = true; break;

            case 82: /*R*/ this.moveUp = true; break;
            case 70: /*F*/ this.moveDown = true; break;

            case 81: /*Q*/ this.freeze = !this.freeze; break;

            }

        };

        this.onKeyUp = function ( event ) {

            switch( event.keyCode ) {

            case 38: /*up*/
            case 87: /*W*/ this.moveForward = false; break;

            case 37: /*left*/
            case 65: /*A*/ this.moveLeft = false; break;

            case 40: /*down*/
            case 83: /*S*/ this.moveBackward = false; break;

            case 39: /*right*/
            case 68: /*D*/ this.moveRight = false; break;

            case 82: /*R*/ this.moveUp = false; break;
            case 70: /*F*/ this.moveDown = false; break;

            }

        };

        this.update = function( delta ) {

            if ( this.freeze ) {

                return;

            }

            if ( this.heightSpeed ) {

                var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
                var heightDelta = y - this.heightMin;

                this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

            } else {

                this.autoSpeedFactor = 0.0;

            }

            var actualMoveSpeed = delta * this.movementSpeed;

            if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
            if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

            if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
            if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

            if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
            if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

            var actualLookSpeed = delta * this.lookSpeed;

            if ( !this.activeLook ) {

                actualLookSpeed = 0;

            }

            var verticalLookRatio = 1;

            if ( this.constrainVertical ) {

                verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

            }

            this.lon += this.mouseX * actualLookSpeed;
            if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

            this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
            this.phi = THREE.Math.degToRad( 90 - this.lat );

            this.theta = THREE.Math.degToRad( this.lon );

            if ( this.constrainVertical ) {

                this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

            }

            var targetPosition = this.target,
            position = this.object.position;

            targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
            targetPosition.y = position.y + 100 * Math.cos( this.phi );
            targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

            this.object.lookAt( targetPosition );

        };


        this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

        this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
        //this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
        //this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
        this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
        this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

        function bind( scope, fn ) {

            return function () {

                fn.apply( scope, arguments );

            };

        }

        this.handleResize();

    };


    Glen.FPSControls = function( args ){

        THREE.FirstPersonControls.call( this, args );
        
        this.lastX = [];
        this.lastY = [];

        this.xDiff = 0;
        this.yDiff = 0;
        this.mouseSensitivity = 5;
        this.useTarget = true;  
        this.constrainHorizontal = true;

        this.cursor = document.createElement('img');
        this.cursor.src = 'http://mrdo.mameworld.info/mame_cross/cross_cross.png';
        this.cursor.style.width = '25px';
        this.cursor.style.position = 'absolute';
        this.cursor.style.display = 'none';
        document.body.appendChild(this.cursor);
        
        this.onMouseMove = function ( event ) {

            if ( this.domElement === document ) {

                this.mouseX = event.pageX - this.viewHalfX;
                this.mouseY = event.pageY - this.viewHalfY;

            } else {

                this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
                this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

            }
            
            if(document.webkitPointerLockElement !== null){
                this.xDiff = event.webkitMovementX;
                this.yDiff = event.webkitMovementY;
                this.cursor.style.top = parseInt(window.innerHeight / 2, 10) + 'px';
                this.cursor.style.left = parseInt(window.innerWidth / 2, 10) + 'px';
                this.cursor.style.display = 'block';
            } else {
                var lx = this.lastX.length > 1 ? this.lastX.pop() : 0;
                var ly = this.lastY.length > 1 ? this.lastY.pop() : 0;
                this.xDiff = this.mouseX - lx;
                this.yDiff = this.mouseY - ly;
                
                this.lastX.unshift(this.mouseX);
                this.lastY.unshift(this.mouseY);
            }
        };

        
        this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
        
        this.update = function( delta ) {

            if ( this.freeze ) {

                return;

            }

            if ( this.heightSpeed ) {

                var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
                var heightDelta = y - this.heightMin;

                this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

            } else {

                this.autoSpeedFactor = 0.0;

            }

            var actualMoveSpeed = delta * this.movementSpeed;

            if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
            if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

            if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
            if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

            if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
            if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

            var actualLookSpeed = delta * this.lookSpeed;

            if ( !this.activeLook ) {

                actualLookSpeed = 0;

            }

            var verticalLookRatio = 1;

            if ( this.constrainVertical ) {

                verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

            }

            if(this.constrainHorizontal){
                this.lon += this.xDiff / this.mouseSensitivity;
                this.lat -= this.yDiff / this.mouseSensitivity;
            } else {
                this.lon += this.mouseX * actualLookSpeed;
                if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
            }

            this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
            this.phi = THREE.Math.degToRad( 90 - this.lat );

            this.theta = THREE.Math.degToRad( this.lon );

            if ( this.constrainVertical ) {

                this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

            }

            var targetPosition = this.target,
            position = this.object.position;

            targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
            targetPosition.y = position.y + 100 * Math.cos( this.phi );
            targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

            if (this.moveForward || this.moveBackward || this.moveRight || 
                this.moveLeft || this.moveUp || this.moveDown || 
                Math.abs(this.xDiff) > 0.1 || Math.abs(this.yDiff) > 0.1) 
            {
                Glen._world.callHook('Move', this);
            }       

            this.xDiff = this.xDiff / 2;
            this.yDiff = this.yDiff / 2;

            this.object.lookAt( targetPosition );

        };
        
        function bind( scope, fn ) {

            return function () {

                fn.apply( scope, arguments );

            };

        }

    };

    Glen.FPSControls.prototype = new THREE.FirstPersonControls();
    Glen.FPSControls.prototype.constructor = Glen.FPSControls;
})();
/***************************************************
 * entity.js
 * Basic entity object as a wrapper for THREE Object3D
 ***************************************************/

(function(){
    'use strict';

    Glen.Entity = {};

    // copies properties of b onto a, like jQuery.extend
    function _extend(a, b){
        for(var key in b)
            if(b.hasOwnProperty(key))
                a[key] = b[key];
        return a;
    }

    _extend(
        THREE.Object3D.prototype,
        {
            getPosition: function(){
                return this.position.clone();
            },
            
            setPosition: function( vector ){
                this.__dirtyPosition = true;
                this.position = vector.clone();
            },
            
            getRotation: function(){
                return this.rotation.clone();
            },
            
            setRotation: function( vector ){
                this.__dirtyRotation = true;
                this.rotation = vector.clone();
            },
            
            rotate: function( vector ){
                this.setRotation( this.getRotation().add(vector) );
            },
            
            getMaterial: function(){
                return this.materials[0];
            },
            
            setMaterial: function(material){
                this.materials[0] = material;
            },

            addHook: function(hook, callback){
                if (!this.hooks) {
                    this.hooks = {};
                }
                if (!this.hooks[hook]) { 
                    this.hooks[hook] = [];
                }
                this.hooks[hook].push(callback);
            },
            
            callHook: function( hook ){
                if (!this.hooks || !this.hooks[hook]) {
                    return;
                }
                var args = Array.prototype.slice.call(arguments);
                args.splice( 0, 1 );
                for (var i in this.hooks[hook]) {
                    this.hooks[hook][i].apply(this, args);
                }
            }
         }
    );

    function getMaterial(args) {
        var material;
        if(args.material){
            material = args.material;
        } else if(args.color){
            material = Glen.Util.ColorMaterial(args.color);
        } else {
            material = new Glen.Util.ColorMaterial(0xffffff);
        }
        return material;
    }

    // todo: figure out a more dynamic prototype-oriented approach to
    // setting base options
    function setBaseOptions(mesh, args) {
        mesh.rotation.copy(args.rotation || Glen.Util.Vector(0,0,0));
        mesh.position.copy(args.position || Glen.Util.Vector(0,0,0));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.shadowMapWidth = args.shadowMapWidth || 4096;
        mesh.shadowMapHeight = args.shadowMapHeight || 4096;
    }

    // Geometries
    Glen.Entity.Block = function(args) {
        var geometry = new THREE.CubeGeometry(args.width, args.height, args.depth);
        Physijs.BoxMesh.call(this, geometry, getMaterial(args), args.mass, {
            restitution: args.restitution || 0.2
        });
        setBaseOptions(this, args);
    };
    Glen.Entity.Block.prototype = Object.create(Physijs.BoxMesh.prototype);

    Glen.Entity.Floor = function(args) {
        args.height = 1;
        args.mass = 0;
        Glen.Entity.Block.call(this, args);
        this.castShadow = false;
    };
    Glen.Entity.Floor.prototype = Object.create(Glen.Entity.Block.prototype);

    Glen.Entity.Sphere = function(args) {
        var geometry = new THREE.SphereGeometry(args.radius, args.segments, args.rings);
        Physijs.SphereMesh.call(this, getMaterial(args), 0, {
            restitution: args.restitution || 0.2
        });
        setBaseOptions(this, args);
    };
    Glen.Entity.Sphere.prototype = Object.create(Physijs.SphereMesh.prototype);

    Glen.Entity.Text = function(args) {
        var geometry = new THREE.TextGeometry(args.text, args);
        Physijs.ConvexMesh.call(this, getMaterial(args), 0, {
            restitution: args.restitution || 0.2
        });
        setBaseOptions(this, args);
    };
    Glen.Entity.Text.prototype = Object.create(Physijs.ConvexMesh.prototype);

    // Lighting
    Glen.Entity.DirectionalLight = function(args) {
        THREE.DirectionalLight.call(this, args.color, args.intensity);
        setBaseOptions(this, args);
        this.receiveShadow = false;
    };
    Glen.Entity.DirectionalLight.prototype = Object.create(THREE.DirectionalLight.prototype);

    // Other
    Glen.Entity.Model = function(args) {
        if(args.geometry === undefined) {
            var loader = new THREE.JSONLoader();
            var ent = this;
            loader.load({model: args.model, callback: function(geometry){
                Physijs.ConvexMesh.call(ent, geometry, new THREE.MeshLambertMaterial());
            }});
        } else {
            Physijs.ConvexMesh.call(this, args.geometry, new THREE.MeshLambertMaterial());
        }
    };
    Glen.Entity.Model.prototype = Object.create(Physijs.ConvexMesh.prototype);
})();
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
        this._clock = new THREE.Clock();    // for updating FPS controls
        this._clock.start();
        this._hooks = {};                   // dict of hooks to the world's events
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
        this.scene.setGravity(args.gravity || Glen.Util.Vector(0, -30, 0));

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
            if(this._fx)
                this.composer.render();
            else 
                this.renderer.render(this.scene, this.camera);
            this.callHook('Render');                            // render hooks
        },

        _think: function(){
            // do things on think
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

            this.callHook('Think', this);
            this.scene.traverse(function(e) {
                e.callHook('Think');
            });
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
                this.scene.fog = new THREE.FogExp2( color || 0xFFFFFF, density || 0.00015 );
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
        }
    };
})();

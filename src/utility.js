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
                args.friction !== undefined ? args.friction : 0.4,
                args.restitution !== undefined ? args.restitution : 0.6
            );
            material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
            material.map.repeat.set( args.repeatX || 2.5, args.repeatY || 2.5 );
            return material;
        },

        ColorMaterial: function( args ) {
            var matArgs = {
                color: args.color,
                shading: THREE.FlatShading,
                opacity: args.opacity !== undefined ? args.opacity : 1,
                transparent: args.opacity !== 1
            };
            var mat = new Physijs.createMaterial(
                args.lambert ? new THREE.MeshLambertMaterial(matArgs) : 
                new THREE.MeshPhongMaterial(matArgs),
                args.friction !== undefined ? args.friction : 1,
                args.restitution !== undefined ? args.restitution : 0.3);
            return mat;
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

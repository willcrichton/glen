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
        var geometry = new THREE.SphereGeometry(args.radius, args.segments || 10, args.rings || 10);
        Physijs.SphereMesh.call(this, geometry, getMaterial(args), args.mass, {
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

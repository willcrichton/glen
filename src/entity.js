/***************************************************
 * entity.js
 * Basic entity object as a wrapper for THREE Object3D
 ***************************************************/

Glen._entities = {};

// copies properties of b onto a, like jQuery.extend
function _extend(a, b){
    for(var key in b)
        if(b.hasOwnProperty(key))
            a[key] = b[key];
    return a;
}

/* Create a custom entity
 * name: unique string associated with entity (don't overrwrite existing entities!)
 * construct: constructor for the entity, called after all extender constructors
 * extender: name of entity to extend, if any
 * extendArgs: map of arguments to pass to extended entity
 * Note for clarity: constructors bubble up from the bottom-level extenders, whereas arguments are 
 * constructed top-down (e.g. top-level arguments overrwrite low-level ones).
 */
Glen.registerEntity = function(name, construct, extender, extendArgs){
    if (typeof Glen._entities[name] != "undefined") {
        throw new Error('"' + name + '" is already defined, cannot reigster it');
    }
    Glen._entities[name] = {
        construct: construct,
        extender: extender,
        extendArgs: extendArgs
    };
};

// Constructor for all entities, takes name and arguments
Glen.Entity = function(ent, args){
    this.hooks = {};
    this.entType = ent;
    var entInfo = Glen._entities[this.entType];
    var entObj;
    var entArgs = args;
    var queue = [];
    do {
        if(entInfo.construct) queue.unshift(entInfo.construct);
        entArgs = _extend(entArgs, 
                          typeof entInfo.extendArgs == "function" ?
                          entInfo.extendArgs(entArgs) :
                          entInfo.extendArgs);
        entInfo = Glen._entities[entInfo.extender];
    } while(typeof entInfo != "undefined");
    for(var i = 0; i < queue.length; i++){
        var newObj = queue[i].call(entObj, entArgs);
        if(newObj !== undefined) entObj = newObj;
    }
    _extend(entObj, this);

    Glen._world.addEntity(entObj);
    return entObj;
};

Glen.Entity.constructor = Glen.Entity;
Glen.Entity.prototype = new THREE.Object3D();
_extend(Glen.Entity.prototype,
        {
            getType: function(){
                return this.entType;
            },
            
            getPos: function(){
                return this.getMesh().position.clone();
            },
            
            setPos: function( vector ){
                this.getMesh().position = vector.clone();
            },
            
            getRotation: function(){
                return this.getMesh().rotation.clone();
            },
            
            setRotation: function( vector ){
                this.getMesh().rotation = vector.clone();
            },
            
            rotate: function( vector ){
                this.setRotation( this.getRotation().add(vector) );
            },
            
            getMaterial: function(){
                return this.getMesh().materials[0];
            },
            
            setMaterial: function(material){
                this.getMesh().materials[0] = material;
            },

            addHook: function(hook, callback){
                if(!this.hooks[hook]) this.hooks[hook] = [];
                this.hooks[hook].push(callback);
            },
            
            callHook: function( hook ){
                var args = Array.prototype.slice.call(arguments);
                args.splice( 0, 1 );
                if(this.hooks[hook]) {
                    for (var i in this.hooks[hook]) {
                        this.hooks[hook][i].apply(this, args);
                    }
                }
            },
            
            remove: function(){
                Glen._world.removeEntity( this );
            },
        });

/* BASIC GEOMETRIES */
Glen.registerEntity("basic", function(args){
    var material;
    if(args.material){
        material = args.material;
    } else if(args.color){
        material = Glen.ColorMaterial(args.color);
    } else {
        material = new Glen.ColorMaterial(0xffffff);
    }
    if(!args.meshfn) throw new Error("Basic entity type requires Physijs mesh constructor");
    if(!args.geometry) throw new Error("Basic entity type requires some THREE.Geometry type");
    var mesh = new args.meshfn(args.geometry, material, typeof args.mass == "undefined" ? 10 : args.mass);
    if(args.rotation) mesh.rotation.copy(args.rotation);
    mesh.position.copy(args.position || Glen.Vector(0,0,0));
    mesh.castShadow = true;

    return mesh;
});

Glen.registerEntity(
    "block", undefined, "basic", 
    function(args){
        return {
            geometry: new THREE.CubeGeometry(args.width, args.height, args.depth),
            meshfn: Physijs.BoxMesh
        };
    });

Glen.registerEntity("floor", function(){
    this.castShadow = false;
    this.receiveShadow = true;
}, "block", {height: 1, mass: 0});

Glen.registerEntity(
    "sphere", undefined, "basic", 
    function(args){
        return {
            geometry : new THREE.SphereGeometry(args.radius, args.segments, args.rings),
            meshfn: Physijs.SphereMesh
        };
    });

Glen.registerEntity(
    "text", undefined, "basic", 
    function(args){
        return {
            geometry: new THREE.TextGeometry(args.text, args),
            meshfn: Physijs.ConvexMesh
        };
    });


/* LIGHTING */
Glen.registerEntity("pointLight", function(args){
    var light = new THREE.PointLight(args.color || 0xFFFFFF);
    light.position.copy(args.position || Glen.Vector(0, 0, 0));
    light.intensity = args.intensity;
    return light;
});

Glen.registerEntity("directionalLight", function(args){
    var light = new THREE.DirectionalLight(args.color || 0xFFFFFF, args.intensity, args.distance);
    light.position.copy(args.position || Glen.Vector(0, 0, 0));
    light.target.position.copy(args.target || Glen._world.scene.position);
    light.castShadow = true;
    // what is this I don't even
    // TODO: figure out how lighting works
    light.shadowCameraLeft = -60;
    light.shadowCameraTop = -60;
    light.shadowCameraRight = 60;
    light.shadowCameraBottom = 60;
    light.shadowCameraNear = 20;
    light.shadowCameraFar = 200;
    light.shadowBias = -0.0001;
    light.shadowMapWidth = light.shadowMapHeight = 2048;
    light.shadowDarkness = 0.7;
    return light;
});

Glen.registerEntity("ambientLight", function(args){
    return new THREE.AmbientLight(args.color || 0xFFFFFF);
});


/* OTHER */
Glen.registerEntity("model", function(args){
    if(typeof args.geometry == "undefined"){
        var loader = new THREE.JSONLoader();
        var ent = this;
        // hack around entity system to make asynchronous loading more convenient
        // TODO: integrate this with entities (or leave it exclusively to user)
        loader.load({model: args.model, callback: function(geometry){
            var mesh = new Physijs.ConvexMesh(geometry, new THREE.MeshLambertMaterial());
            ent.setMesh(mesh);
            world.scene.Object(mesh);
        }});
        return undefined;
    } else {
        return new Physijs.ConvexMesh(args.geometry, new THREE.MeshLambertMaterial());
    }
});

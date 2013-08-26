/******************************************************
 * camera.js: for your first person needs
 * TODO: remove the awkward magic numbers from anchor/such
 ******************************************************/

(function(){
    'use strict';

    Glen.FPSControls = function( camera, domElement ){

        this.update = function(){}

        this.lastX = [];
        this.lastY = [];

        this.xDiff = 0;
        this.yDiff = 0;
        this.mouseSensitivity = 5;
        this.useTarget = true;  

        this.camera = camera;
        this.target = new THREE.Vector3( 0, 0, 0 );

        this.domElement = ( domElement !== undefined ) ? domElement : document;

        this.movementSpeed = 1.0;
        this.lookSpeed = 0.005;

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

        this.viewHalfX = 0;
        this.viewHalfY = 0;

        this.anchor = new Glen.Entity.Sphere({
            radius: 5, 
            mass: 1,
            material: Glen.Util.ColorMaterial({
                color: new THREE.Color(0),
                friction: 0,
                restitution: 0
            }),
            position: Glen.Util.Vector(0, 10, 0)
        });
        this.anchor.castShadow = false;
        this.anchor.receiveShadow = false;
        this.anchor.visible = false;
        Glen._world.add(this.anchor);

        this.raycaster = new THREE.Raycaster();

        this.noclip = false;

        if ( this.domElement !== document ) {

            this.domElement.setAttribute( 'tabindex', -1 );

        }

        this.handleResize = function () {

            if ( this.domElement === document ) {

                this.viewHalfX = window.innerWidth / 2;
                this.viewHalfY = window.innerHeight / 2;

            } else {

                this.viewHalfX = this.domElement.offsetWidth / 2;
                this.viewHalfY = this.domElement.offsetHeight / 2;

            }

        };

        this.onMouseMove = function ( event ) {

            if ( this.domElement === document ) {

                this.mouseX = event.pageX - this.viewHalfX;
                this.mouseY = event.pageY - this.viewHalfY;

            } else {

                this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
                this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

            }
            
            if(document.webkitPointerLockElement){
                this.xDiff = event.webkitMovementX;
                this.yDiff = event.webkitMovementY;
                /*this.cursor.style.top = parseInt(window.innerHeight / 2, 10) + 'px';
                this.cursor.style.left = parseInt(window.innerWidth / 2, 10) + 'px';
                this.cursor.style.display = 'block';*/
            } else {
                var lx = this.lastX.length > 1 ? this.lastX.pop() : 0;
                var ly = this.lastY.length > 1 ? this.lastY.pop() : 0;
                this.xDiff = this.mouseX - lx;
                this.yDiff = this.mouseY - ly;
                
                this.lastX.unshift(this.mouseX);
                this.lastY.unshift(this.mouseY);
            }
        };

        this.update = function( delta ) {

            if (this.freeze) {
                return;
            }

            var actualMoveSpeed = delta * this.movementSpeed;

            if (this.noclip) {

                if ( this.moveForward ) this.camera.translateZ( - actualMoveSpeed );
                if ( this.moveBackward ) this.camera.translateZ( actualMoveSpeed );
                
                if ( this.moveLeft ) this.camera.translateX( - actualMoveSpeed );
                if ( this.moveRight ) this.camera.translateX( actualMoveSpeed );
                
                if ( this.moveUp ) this.camera.translateY( actualMoveSpeed );
                if ( this.moveDown ) this.camera.translateY( - actualMoveSpeed );

                var pos = this.camera.position.clone();
                this.anchor.__dirtyPosition = true;
                this.anchor.position.copy(pos.sub(new THREE.Vector3(0, 10, 0)));

            } else {

                this.raycaster.set(this.anchor.position, new THREE.Vector3(0, -1, 0));
                var floor = this.raycaster.intersectObjects(Glen._world.scene.children)[0];

                if (floor && Math.round(floor.distance) <= 5) {
                    var rot = this.camera.rotation.clone();
                    var dir = new THREE.Vector3(0, 0, -1);
                    dir.applyEuler(rot, this.camera.eulerOrder);
                    dir.y = 0;
                    dir.normalize();

                    var axis = new THREE.Vector3(0, 1, 0);
                    var moveDir = new THREE.Vector3();

                    if (this.moveForward) {
                        moveDir.add(dir);
                    }

                    if (this.moveBackward) {
                        moveDir.sub(dir);
                    }

                    if (this.moveLeft) {
                        var matrix = new THREE.Matrix4().makeRotationAxis(axis, Math.PI / 2);
                        moveDir.add(dir.clone().applyMatrix4(matrix));
                    }

                    if (this.moveRight) {
                        var matrix = new THREE.Matrix4().makeRotationAxis(axis, -Math.PI / 2);
                        moveDir.add(dir.clone().applyMatrix4(matrix));
                    }

                    moveDir.normalize();
                    if (this.jump) {
                        this.jump = false;
                        this.jumping = true;
                        moveDir.add(new THREE.Vector3(0, 0.2, 0));
                    }
                    
                    if (moveDir.length() > 0) {
                        var vel = moveDir.multiplyScalar(delta * 15 * this.movementSpeed);
                        this.anchor.setLinearVelocity(vel);
                        //this.anchor.__dirtyPosition = true;
                        //this.anchor.translateOnAxis(moveDir, delta * 2);
                    } else {
                        this.anchor.setLinearVelocity(new THREE.Vector3());
                    }
                } 

                var pos = this.anchor.position.clone();
                this.camera.position.copy(pos.add(new THREE.Vector3(0, 10, 0)));

                this.anchor.__dirtyRotation = true;
                this.anchor.rotation.copy(new THREE.Vector3(0, 0, 0));

            }

            var actualLookSpeed = delta * this.lookSpeed;

            this.lon += this.xDiff / this.mouseSensitivity;
            this.lat -= this.yDiff / this.mouseSensitivity;

            this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
            this.phi = THREE.Math.degToRad( 90 - this.lat );

            this.theta = THREE.Math.degToRad( this.lon );

            var targetPosition = this.target,
            position = this.camera.position;

            targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
            targetPosition.y = position.y + 100 * Math.cos( this.phi );
            targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

            this.xDiff = this.xDiff / 2;
            this.yDiff = this.yDiff / 2;

            this.camera.lookAt( targetPosition );

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

            case 32: /*space*/ this.jump = true; break;
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

        this.domElement.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
        this.domElement.addEventListener( 'keydown', this.onKeyDown.bind(this), false );
        this.domElement.addEventListener( 'keyup', this.onKeyUp.bind(this), false );
        
        this.handleResize();

    };
})();

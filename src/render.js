var _controlClock = new THREE.Clock();
// Called every frame to render the world and call any custom rendering from the world object
Glen.renderWorld = function( world ){
	world.thinkInternal();
	world.scene.simulate( undefined, 2 );
	world.controls.update(_controlClock.getDelta());
	world.callHook( 'render', world );
	world.renderer.render(world.scene, world.camera);
	requestAnimationFrame(function(){ Glen.renderWorld( world ); });
}
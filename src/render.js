// Called every frame to animate the world and request a new animation frame
Engine.animateWorld = function( world ){
	
	requestAnimationFrame( function(){
		Engine.animateWorld( world );
	});
	Engine.renderWorld( world );

}

// Also called every frame to actually render the world and call any custom rendering from the world object
Engine.renderWorld = function( world ){

	world.callHook( 'render', world );
	world.renderer.render(world.scene,world.camera);
	world.thinkInternal();
	
}
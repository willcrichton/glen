// Called every frame to animate the world and request a new animation frame
Glen.animateWorld = function( world ){
	
	requestAnimationFrame( function(){
		Glen.animateWorld( world );
	});
	Glen.renderWorld( world );

}

// Also called every frame to actually render the world and call any custom rendering from the world object
Glen.renderWorld = function( world ){

	world.callHook( 'render', world );
	world.renderer.render(world.scene,world.camera);
	world.thinkInternal();
	
}
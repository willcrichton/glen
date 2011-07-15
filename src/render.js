// Called every frame to animate the world and request a new animation frame
ENGINE.animateWorld = function( world ){
	
	requestAnimationFrame( function(){
		ENGINE.animateWorld( world );
	});
	ENGINE.renderWorld( world );

}

// Also called every frame to actually render the world and call any custom rendering from the world object
ENGINE.renderWorld = function( world ){

	world.render();
	world.renderer.render(world.scene,world.camera);
	
}
<!DOCTYPE html>
<html>
	<head>
		<title>Sound Testing</title>
		<link href="styles/jquery-ui-1.8.14.custom.css" rel="stylesheet" type="text/css" />
		<link href="styles/audio.css" rel="stylesheet" type="text/css" />
	</head>
	<body>
		<script src='http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'></script>
		<script src="engine/lib/jquery-ui-1.8.14.custom.min.js"></script>
		<script src='engine/lib/Three.js'></script>
		<script src="engine/engine.js"></script>
		<script src='engine/utility.js'></script>
		<script src='engine/socket.js'></script>
		<script src='engine/material.js'></script>
		<script src='engine/entity.js'></script>
		<script src='engine/render.js'></script>
		<script src='engine/world.js'></script>
		<script src="sound/beatdetektor.js"></script>
		<script src="sound/audio.js"></script>
		<script>
			var world, bAudioLoaded, processForm, processor, changeColor;
			jQuery(document).ready(function($){
				
				/*** WebGL rendering mumbo jumbo ***/
				
				// Set up world to render in 
				world = new Glen.World({
					canvas: {
						height: window.innerHeight - 5,
						width: window.innerWidth 
					},
					container: 'body',
					position: Vector(0,500,3000),
				});
				
				// Camera movement
				world.addHook('Think',function(){
					this.camera.position.x += ( this.mouse.mouseX * 2- this.camera.position.x ) * 0.05;
					this.camera.position.y += ( this.mouse.mouseY * 2 - this.camera.position.y ) * 0.05;
					this.camera.lookAt( this.scene.position );
				});
				
				// Generate visualization spectrum
				blocks = [];
				specWidth = 48;		// number of blocks in the spectrum to display
				function genBlocks( width ){
					// Get rid of existing blocks (if we're resetting for some reason)
					for( i in blocks )
						world.removeEntity(blocks[i]);
					blocks = [];
					for( var i = 0; i < width; i++ ){
						// Create new block and add to spectrum
						var b = new Glen.Entity("block",{
							width: 100, height: 100, depth: 100,
							material: ColorMaterial(Color(255 * (1 - i / specWidth),255 * i / specWidth,0)),
							pos: Vector(-100 * 25 + i * 100,-1000,0)
						});
						blocks.push(b);
					}
				}
				genBlocks(specWidth);
				
				// Lighting
				new Glen.Entity("ambientLight",{color: 0xCCCCCC});
				new Glen.Entity("directionalLight",{
					pos: Vector(1,1,0.5).normalize(), 
					color: 0xCCCCCC, 
					intensity: 1.5
				});

				
				/*** Audio visualization wizardry ***/
				
				// Audio load callback
				function audioLoad(){
					console.log("Audio loaded!");
					$('#window').css('display','none');
					var duration = processor.source.buffer.duration;
					$('#currentTime').html('00:00');
					$('#songDuration').html( Math.floor(duration/60) + ':' + (duration%60 < 10 ? '0' : '') + Math.floor(duration%60) );
					$('#songInfo').animate({opacity:1},300);
					$('#loadBox').animate({ opacity: 0 },300,'linear',function(){
						$('#loadBox').css('display','none');
						world.camera.position.y = 100000;
						world.startRender();
					});
				}
				
				// Visualization callback (calls when data received from audio track)
				var bgcolor = {r:0,g:0,b:0};
				var specRange = 14;
				function visualize( freqByteData, kick, kickLevel ){
					// Handle kicks (todo: this is inconsistent w/ anims)
					if(kick && kickLevel > 0.47){
					
						// Brighten screen on beat
						bgcolor = {r:15,g:15,b:15};
						
						if( kickLevel > 0.60 ){
							// Screen shake? Particle effects?
						}
						
					} else {
						// Reset screen colors to black after eat
						bgcolor.r = Math.max(bgcolor.r-1,0);
						bgcolor.g = Math.max(bgcolor.g-1,0);
						bgcolor.b = Math.max(bgcolor.b-1,0);
					}
					// Set screen colors according to beat
					$('body').css('background','rgb(' + bgcolor.r + ', ' + bgcolor.g + ', ' + bgcolor.b + ')');
					
					var box = 0
					// Iterate over each box, accounting for number of FFT values specified by specRange
					for( var i = 0; i < specWidth * specRange; i += specRange ){
						var avg = 0;
						// Find sum of all FFT values in a particular range
						for( var q = 0; q < specRange; q++ ) avg += freqByteData[i + q + specRange * 2 + 1];
						// Set height (scale) of objects
						var scale = 1 + avg / specRange * 0.08;
						var obj = blocks[box].getObject();
						obj.scale.y = scale;
						// Account for position in setting scale
						obj.position.y = scale * specWidth - 1000;
						box++;
					}
					
					// Get current position in song and update songProgress div
					if(processor && processor.source && processor.source.buffer && processor.source.buffer.duration){
						var duration = processor.source.buffer.duration
						var current = processor.source.context.currentTime;
						$('#currentTime').html( Math.floor(current / 60 ) + ':' + (current%60 < 10 ? '0' : '') + Math.floor(current%60) );
						$('#songProgress div').css('width',$('#songProgress').innerWidth() * Math.min(current / duration,1));
						
						if(current > duration) alert("Song ended!");
					}					
				}				

				<? if(isset($_FILES['songUpload'])): 
				rename($_FILES['songUpload']['tmp_name'],'sound/' . $_FILES['songUpload']['name']);
				if($_FILES['songUpload']['name'] != '')
					chmod('sound/' . $_FILES['songUpload']['name'],0644);
				?>
				var processor = new AudioProcessor('<?=('sound/' . $_FILES['songUpload']['name'])?>',visualize,audioLoad);
				processor.fetchMusic();
				$('#loadBox').css('display','block').css('opacity','1');
				<? endif; ?>
				
				/*** DOM handling ***/
				
				// Handle forms/visualization requests
				processForm = function(f){
					if(f.songUpload.value != '')
						return true;
					else {
						processor = new AudioProcessor( "sound/" + f.songSelect.value, visualize, audioLoad );
						$('#songName').html(f.songSelect.options[f.songSelect.selectedIndex].text);
						$(f).animate({opacity: 0}, 300, 'linear', function(){
							$(this).css('display','none');
							$('#loadBox').css('display','block').animate({opacity:1},300,'linear',function(){
								processor.fetchMusic();	
							});
						});
						
						return false;
					}
				}
				
				// Handle control panel pop up
				var panelShow = false;
				$('#controlToggle').click(function(){
					panelShow = !panelShow;
					if(panelShow){
						$('#controlToggle img').attr('src','images/arrow-down.png');
						$('#controlPanel').animate({
							height: 100,
							width: 210
						},50,function(){ $('#controlContent').css('display','block'); });
					} else {
						$('#controlToggle img').attr('src','images/arrow-up.png');
						$('#controlContent').css('display','none');
						$('#controlPanel').animate({
							height: 32,
							width: 32
						},50);
					}
				});
				
				// Function callback for color selector in control panel
				changeColor = function(select){
					for( var i = 0; i < specWidth; i++ ){
						var b = blocks[i];
						var color;
						switch(select.value){
							case 'grayscale':
								var c = 255 * (1 - i / specWidth);
								color = Color(c,c,c);
								break;
							case 'bluepurple':
								color = Color( 255 * i / specWidth, 0, 255 );
								break;
							case 'redgreen':
								color = Color( 255 * (1 - i / specWidth), 255 * i / 50, 0 );
								break;
						}
						b.getMesh().materials[0] = ColorMaterial(color);
					}
				}
				
				// Change the range of FFT values which each block analyzes
				$('#specRange').slider({
					animate: true,
					min: 1,
					max: 20,
					value: 14,
					slide: function(e){
						specRange = $(this).slider('value');
					}
				});
				
				// Change the number of blocks
				/*** TODO: Optimize this to just add/subtract necessary blocks + get colors right for add-on blocks ***/
				$('#specWidth').slider({
					animate: true,
					min: 10,
					max: 100,
					value: 48,
					slide: function(e){
						specWidth = $(this).slider('value');
						genBlocks(specWidth);
					}
				});
			});
						
		</script>
		
		<? if(!isset($_FILES['songUpload'])): ?>
		<div id="window">
			<h1>music visualizer</h1><!--hipster lowercase-->
			<p>Select a song to play, or upload your own.</p>
			<form method="POST" enctype="multipart/form-data" onsubmit="return processForm(this)">
				<div style="overflow:auto;">
					<select name="songSelect">
						<option value="derezzed.mp3">Derezzed &mdash; Daft Punk</option>
						<option value="stress.mp3">Stress &mdash; Justice</option>
						<option value="killerqueen.mp3">Killer Queen &mdash; Queen</option>
					</select>
					<input type="file" name="songUpload" />
				</div>
				<input type="submit" value="Play" />
			</form>
		</div><!--#window-->
		<? endif; ?>
		<div id="loadBox">
			<img src="images/loading2.gif" />
		</div><!--#loadBox-->
		<div id="controlPanel">
			<div id="controlToggle">
				<img src="images/arrow-up.png" />
			</div><!--#controlToggle-->
			<div id="controlContent">
				<form onsubmit="return checkControl(this)">
					<div>
						Color Scheme: <select name="colorScheme" onchange="changeColor(this)">
							<option value="redgreen">Red/Green</option>
							<option value="grayscale">Grayscale</option>
							<option value="bluepurple">Blue/Purple</option>
						</select>
					</div>
					<div>
						<table>
							<tr><td>Range:</td><td><div id="specRange"></div></td></tr>
							<tr><td>Width:</td><td><div id="specWidth"></div></td></tr>
						</table>
					</div>
				</form>
			</div><!--#controlContent-->
		</div><!--#controlPanel-->
		<div id="songInfo">
			<div><b>Currently Playing: </b> <span id="songName"></span> (<span id="currentTime"></span>/<span id="songDuration"></span>)</div>
			<div id="songProgress"><div></div></div>
		</div><!--#songInfo-->
	</body>
</html>
AudioProcessor = function( mp3, fftCallback, audioLoadCallback ){

	var detector = new BeatDetektor(50,199);
	var kick = new BeatDetektor.modules.vis.BassKick();
	var vu = new BeatDetektor.modules.vis.VU();
	var that = this;
	this.callback = fftCallback || function(){};
	function fftProcess( event ){
		var inputArrayL = event.inputBuffer.getChannelData(0);
		var inputArrayR = event.inputBuffer.getChannelData(1);
		var outputArrayL = event.outputBuffer.getChannelData(0);
		var outputArrayR = event.outputBuffer.getChannelData(1);
		
		var n = inputArrayL.length;
		for (var i = 0; i < n; ++i) {
			outputArrayL[i] = inputArrayL[i];
			outputArrayR[i] = inputArrayR[i];
		}
			
		var freqByteData = new Uint8Array(analyzer.frequencyBinCount);
		analyzer.getByteFrequencyData(freqByteData);
		
		detector.process( context.currentTime, inputArrayL );
		kick.process( detector );
		vu.process( detector );
		
		var kickAvg = 0;
		for( var i = 0; i < 80; i++ ) kickAvg += vu.getLevel(i);
		kickAvg /= 80;
		
		that.callback( freqByteData, kick.isKick(), kickAvg, inputArrayL );					
	}
	
	var context = new webkitAudioContext();
	var source = context.createBufferSource();
	var processor = context.createJavaScriptNode(2048);
	

	processor.onaudioprocess = fftProcess;
	
	var analyzer = context.createAnalyser();
	analyzer.fftSize = 2048;
	analyzer.smoothingTimeConstant = 0.75;
	
	source.connect(processor);
	processor.connect(analyzer);
	analyzer.connect(context.destination);
	
	var request = new XMLHttpRequest();
	request.open("GET",mp3,true);
	request.responseType = "arraybuffer";
	request.onload = function(){
		source.buffer = context.createBuffer(request.response, false);
		source.loop = true;
		source.noteOn(0);
		if(audioLoadCallback) audioLoadCallback();
	}
	this.fetchMusic = function(){
		request.send();
	}
	this.source = source;
		
}
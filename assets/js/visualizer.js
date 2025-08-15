var visualizerInstance;

function startMusic() {
	toggleIcon(true);
    visualizerInstance = new Visualizer();
    visualizerInstance.ini();
	visualizerInstance.prepareAPI();
    visualizerInstance.start('black-sabbath-paranoid.mp3');
	document.getElementById('playIcon').style.display = 'none'; // Hide play icon
 	document.getElementById('pauseIcon').style.display = 'block'; // Show pause icon
}


function pauseIcon() {
	toggleIcon(false);
	if (visualizerInstance) {
		visualizerInstance.end(); // Call the end method
	}
	document.getElementById('playIcon').style.display = 'block'; // Show play icon
  	document.getElementById('pauseIcon').style.display = 'none'; // Hide pause icon
}




function canvasSizeAdjust() {
	document.getElementById('canvas').width=window.innerWidth;
	document.getElementById('canvas').height=window.innerHeight;
	console.log(document.getElementById('canvas').width);
}

canvasSizeAdjust();
window.onresize=canvasSizeAdjust;

var Visualizer=function() {
	this.file=null;
	this.fileName=null;
	this.audioContext=null;
	this.source=null;
	this.animationId=null;
	this.status=0;
	this.forceStop=false;
};

function toggleIcon(isPlaying) {
    var playIcon = document.getElementById('playIcon');
    var pauseIcon = document.getElementById('pauseIcon');
    if (isPlaying) {
        playIcon.style.opacity = 0;
        pauseIcon.style.opacity = 1;
    } else {
        playIcon.style.opacity = 1;
        pauseIcon.style.opacity = 0;
    }
}


Visualizer.prototype={
	ini:function() {
		this.prepareAPI();
	},
	prepareAPI:function() {
		window.AudioContext=window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
		window.requestAnimationFrame=window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
		window.cancelAnimationFrame=window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
		try{this.audioContext=new AudioContext();}
		catch(e){console.log(e);}
	},
	
	/*
	addEventListner:function() {
		

		
		var that=this;
		var audioInput=document.getElementById('uploadedFile');
		var dropContainer=document.getElementsByTagName("canvas")[0];

		audioInput.onchange=function() {
			if(audioInput.files.length!==0) {
				that.file=audioInput.files[0];
				that.fileName=that.file.name;
				document.getElementById('filename').innerHTML=that.fileName;
				document.getElementById('filename').className='file';
				if(that.status===1) that.forceStop=true;
				that.start();
			}
		}
		
		
	}
	*/
	
	start: function(url) {
		var that = this;
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			var audioContext = that.audioContext;
			if(audioContext === null) return;
			audioContext.decodeAudioData(request.response, function(buffer) {
				that.visualize(audioContext, buffer);
			}, function(e) { console.log(e); });
		};
		request.onerror = function(e) { console.log(e); };
		request.send();
	},
	visualize:function(audioContext,buffer) {
		var audioBufferSouceNode=audioContext.createBufferSource();
		var analyser=audioContext.createAnalyser();
		var that=this;
		audioBufferSouceNode.connect(analyser);
		analyser.connect(audioContext.destination);
		audioBufferSouceNode.buffer=buffer;
		if(!audioBufferSouceNode.start) {
			audioBufferSouceNode.start=audioBufferSouceNode.noteOn;
			audioBufferSouceNode.stop=audioBufferSouceNode.noteOff;
		}
		if(this.animationId!==null) cancelAnimationFrame(this.animationId);
		if(this.source!==null) this.source.stop(0);
		audioBufferSouceNode.start(0);
		this.status=1;
		this.source=audioBufferSouceNode;
		audioBufferSouceNode.onended=function(){that.audioEnd(that);};
		this.drawSpectrum(analyser);
	},
	drawComputer:{
		data:[],
		qMin:0.05,
		qMax:1,
		q:100,
		mColor:64,
		background:'#000',
		get nf() {return window.innerWidth/20},
		get d() {return 100/this.nf;},
		m:function(array) {
			var m=0;
			for(var i=0; i<array.length; i++) m+=array[i]*(i>0.95*array.length ? 3 : 1);
			return m/array.length;
		},
		pushData(array) {
			this.data.push(this.m(array));
			this.data.slice(0,this.data.length-1-this.nf*2);
		},
		gfContrast:function() {
			var n=2*this.m(this.data);
			return new Function("y","return y*("+((4*(1-this.qMin))/Math.pow(n,2))+"*Math.pow(y,2)-"+((4*(1-this.qMin))/n)+"*y+"+this.qMax+")");
		}
	},
	drawSpectrum:function(analyser) {
		var that=this;
		var canvas=document.getElementById('canvas');
		var context=canvas.getContext('2d');
		context.fillStyle=that.drawComputer.background;
		var drawMeter=function() {
			var array=new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			if(that.status===0) cancelAnimationFrame(that.animationId);
			
			that.drawComputer.pushData(array);
			
			var data=that.drawComputer.data;
			var currentData=data.length-1;

			var fContrast=that.drawComputer.gfContrast();
			
			var q=that.drawComputer.q;
			var nf=that.drawComputer.nf;
			var d=that.drawComputer.d;

			var mColor=that.drawComputer.mColor;
			var color={
				r:Math.round(data[currentData]/(2*q)*255+mColor),
				g:Math.round(data[currentData>100 ? currentData-100 : 0]/(2*q)*255+mColor),
				b:Math.round(data[currentData>200 ? currentData-200 : 0]/(2*q)*255+mColor)
			};
			color={r:color.r>255 ? 255 : color.r,g:color.g>255 ? 255 : color.g,b:color.b>255 ? 255 : color.b};
			context.strokeStyle='rgb('+color.r+','+color.g+','+color.b+')';
			
			context.fillRect(0,0,canvas.width,canvas.height);
			
			context.lineWidth=fContrast(5*data[currentData]/q);
			
			context.beginPath();
			for(var i=0; i<nf && i<data.length-1; i++) {
				var x1=canvas.width/2-i*2*(canvas.width/nf);
				var y1=((canvas.height-fContrast(data[data.length-1-i])/2*canvas.height+canvas.height/2))/((i*i*i+nf)*d)+canvas.height/2;
				var x2=canvas.width/2-(i*2+1)*(canvas.width/nf);
				var y2=((fContrast(data[data.length-1-i])/2*canvas.height+canvas.height/2))/((i*i*i+1+nf)*d)+canvas.height/2;
				
				if(i==0) context.moveTo(x1,y1);
				else {
					var ly=((fContrast(data[data.length-i])/2*canvas.height+canvas.height/2))/(((i-1)*(i-1)*(i-1)+1+nf)*d)+canvas.height/2;
					context.bezierCurveTo(x1+canvas.width/(nf*2),ly,x1+canvas.width/(nf*2),y1,x1,y1);
				}
				context.bezierCurveTo(x1-canvas.width/(nf*2),y1,x1-canvas.width/(nf*2),y2,x2,y2);
			}
			context.stroke();
			context.closePath();
			
			context.beginPath();
			for(var i=0; i<nf && i<data.length-1; i++) {
				var x1=canvas.width/2+i*2*(canvas.width/nf);
				var y1=((canvas.height-fContrast(data[data.length-1-i])/2*canvas.height+canvas.height/2))/((i*i*i+nf)*d)+canvas.height/2;
				var x2=canvas.width/2+(i*2+1)*(canvas.width/nf);
				var y2=((fContrast(data[data.length-1-i])/2*canvas.height+canvas.height/2))/((i*i*i+1+nf)*d)+canvas.height/2;
				
				if(i==0) context.moveTo(x1,y1);
				else {
					var ly=((fContrast(data[data.length-i])/2*canvas.height+canvas.height/2))/(((i-1)*(i-1)*(i-1)+1+nf)*d)+canvas.height/2;
					context.bezierCurveTo(x1-canvas.width/(nf*2),ly,x1-canvas.width/(nf*2),y1,x1,y1);
				}
				context.bezierCurveTo(x1+canvas.width/(nf*2),y1,x1+canvas.width/(nf*2),y2,x2,y2);
			}
			context.stroke();
			context.closePath();
			
			that.animationId=requestAnimationFrame(drawMeter);
		}
		this.animationId=requestAnimationFrame(drawMeter);
	},
	audioEnd:function(instance) {
		if(this.forceStop) {
			this.forceStop=false;
			this.status=1;
			return;
		}
		this.status=0;
		document.getElementById('uploadedFile').value='';
		document.getElementById('filename').className='';
	},

	end: function(instance) {
		if (this.source) {
			this.source.stop(0); // Stop the audio
		}
		this.status = 0;
		this.forceStop = true;
		if (this.animationId) {
			cancelAnimationFrame(this.animationId); // Stop the animation
		}
	}
}

window.onload=function() {
	new Visualizer().ini();
	// Bind the click event to the pauseIcon
	document.getElementById('pauseIcon').onclick = pauseIcon;
}

var s=setTimeout(function() {
	document.getElementById('playMusicCard').className='hover';
	document.getElementById('playMusicCard').onmouseout=function() {
		document.getElementById('playMusicCard').className='';
		document.getElementById('playMusicCard').onmouseout=function(){};
	}
},2000);

document.getElementById('playMusicCard').onmouseover=function() {clearTimeout(s);};
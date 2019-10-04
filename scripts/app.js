var g_audioContext = null;
var g_transmitting = false;
var g_receiving = false;
var g_oscillator = null
var g_analyser = null;
var g_dataArray = null;
var g_timeArray = null;

function getAudioContext(){
  if(g_audioContext != null)
    return g_audioContext

  var AudioContext = window.AudioContext || window.webkitAudioContext;
  g_audioContext = new AudioContext();
  return g_audioContext
}

function startReceiver(){
  if(g_analyser != null){
    captureAudio();
    return
  }

  if (navigator.mediaDevices) {
      console.log('getUserMedia supported.');
      navigator.mediaDevices.getUserMedia ({audio: true, video: false})
      .then(function(stream) {
          // Create a MediaStreamAudioSourceNode
          // Feed the HTMLMediaElement into it
          var context = getAudioContext();
          var source = context.createMediaStreamSource(stream);

          g_analyser = context.createAnalyser();
          g_analyser.connect(context.destination)
          source.connect(g_analyser)

          g_analyser.minDecibels = -200
          g_analyser.fftSize = 1024;
          var bufferLength = g_analyser.frequencyBinCount;
          console.log('bufferLength',bufferLength,'sampleRate', g_analyser.sampleRate);
          g_dataArray = new Uint8Array(bufferLength);
          g_timeArray = new Uint8Array(bufferLength);
          captureAudio();
      })
      .catch(function(err) {
          alert('The following error occured: ' + err);
      });
  } else {
     alert('getUserMedia not supported on your browser!');
  }
}

function captureAudio(){
  if(!g_receiving) return;

  var drawVisual = window.requestAnimationFrame(captureAudio);

  drawFrequency(1);
  drawTimeWave(2);
}

function drawFrequency(canvasIndex){
  var canvas = document.getElementById('canvas'+canvasIndex);
  var ctx = canvas.getContext('2d');
  g_analyser.getByteFrequencyData(g_dataArray);
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var barWidth = (canvas.width / g_dataArray.length) * 2.5;
  var barHeight;
  var x = 0;

  for(var i = 0; i < g_dataArray.length; i++) {
    barHeight = g_dataArray[i];

    ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
    ctx.fillRect(x, canvas.height-barHeight,barWidth,barHeight);

    x += barWidth + 1;
  }
}

function drawTimeWave(canvasIndex){
  var canvas = document.getElementById('canvas'+canvasIndex);
  var ctx = canvas.getContext('2d');

  g_analyser.getByteTimeDomainData(g_timeArray);

  ctx.fillStyle = "rgb(200, 200, 200)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgb(0, 0, 0)";

  ctx.beginPath();

  var sliceWidth = canvas.width * 1.0 / g_timeArray.length;
  var x = 0;

  for (var i = 0; i < g_timeArray.length; i++) {

    var v = g_timeArray[i]/128;
    var y = v * canvas.height / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

function stopReceiver(){
  for( var i=1;i<=2;i++){
    var canvas = document.getElementById('canvas'+i);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function startTransmitter(){
  var context = getAudioContext();
  if(g_oscillator == null){
    g_oscillator = context.createOscillator();
    g_oscillator.start()
  }
  g_oscillator.type = "sine"
  g_oscillator.frequency.value = parseInt(document.getElementById('freq').value)||1000;
  // can't start multiple time, so just attach detach
  g_oscillator.connect(context.destination)
  console.log("started",context, g_oscillator)
}

function stopTransmitter(){
  g_transmitting = false;
  var context = getAudioContext();
  g_oscillator.disconnect(context.destination)
  console.log("stopped", g_oscillator)
}

function toggleReceiver(){
  if(g_receiving){
    g_receiving = false;
    stopReceiver();
    document.getElementById('btn_receiver').innerText = "Start Transmitter";
  }else{
    g_receiving = true;
    startReceiver()
    document.getElementById('btn_receiver').innerText = "Stop Transmitter";
  }
}

function toggleTransmitter(){
  if(g_transmitting){
    g_transmitting = false;
    stopTransmitter();
    document.getElementById('btn_transmitter').innerText = "Start Transmitter";
  }else{
    g_transmitting = true;
    startTransmitter()
    document.getElementById('btn_transmitter').innerText = "Stop Transmitter";
  }
}

function onload(){
  // register click events
  document.getElementById('btn_transmitter').onclick = toggleTransmitter
  document.getElementById('btn_receiver').onclick = toggleReceiver
}

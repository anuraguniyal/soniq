var g_audioContext = null;
var g_transmitting = false;
var g_receiving = false;
var g_oscillator = null
var g_analyser = null;
var g_dataArray = null;
var g_width=null;
var g_height=null;

function getAudioContext(){
  if(g_audioContext != null)
    return g_audioContext

  var AudioContext = window.AudioContext || window.webkitAudioContext;
  g_audioContext = new AudioContext();
  return g_audioContext
}

function getCanvasContext(){
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  g_width = canvas.width;
  g_height = canvas.height;
  return ctx;
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

          g_analyser.fftSize = 256;
          var bufferLength = g_analyser.frequencyBinCount;
          console.log(bufferLength);
          g_dataArray = new Uint8Array(bufferLength);
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

  var ctx = getCanvasContext();
  var drawVisual = window.requestAnimationFrame(captureAudio);
  g_analyser.getByteFrequencyData(g_dataArray);
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(0, 0, g_width, g_height);

  var barWidth = (g_width / g_dataArray.length) * 2.5;
  var barHeight;
  var x = 0;

  for(var i = 0; i < g_dataArray.length; i++) {
    barHeight = g_dataArray[i];

    ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
    ctx.fillRect(x, g_height-barHeight/2,barWidth,barHeight/2);

    x += barWidth + 1;
  }
}

function stopReceiver(){
  console.log("canvas", g_width, g_height);
  var ctx = getCanvasContext();
  ctx.fillStyle = 'rgb(255, 0, 0)';
  ctx.fillRect(0, 0, g_width, g_height);
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

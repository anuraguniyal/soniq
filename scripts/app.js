var g_audioContext = null;
var g_transmitting = false;
var g_receiving = false;
var g_oscillator = null

function getAudioContext(){
  if(g_audioContext != null)
    return g_audioContext

  var AudioContext = window.AudioContext || window.webkitAudioContext;
  g_audioContext = new AudioContext();
  return g_audioContext
}

function startReceiver(){
}


function startTransmitter(){
  g_transmitting = true ;
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
}

function toggleTransmitter(){
  if(g_transmitting){
    stopTransmitter();
  }else{
    startTransmitter()
  }
}

function onload(){
  // register click events
  document.getElementById('btn_transmitter').onclick = toggleTransmitter
  document.getElementById('btn_receiver').onclick = toggleReceiver
}

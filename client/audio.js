/* global easyrtc AudioContext*/
const $ = require('jquery')

function processAudio () {
  console.log('preparing to process audio...')
  var aCtx = new AudioContext()
  var analyser = aCtx.createAnalyser()
  var whosVideo = $('#box0')
  var whosTalking = $('#box0Talk')
  var volumeDuration = []
  var audioSource = aCtx.createMediaStreamSource(easyrtc.getLocalStream())
  audioSource.connect(analyser)
  setInterval(function () {
    // get the average, bincount is fftsize / 2
    var array = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(array)
    var volume = getAverageVolume(array)
    var threshold = 20

    if (volume > threshold) {
      whosTalking.html('you\'re talking!')
      volumeDuration.push(whosVideo.currentTime)
    } else {
      whosTalking.html('you are not talking!')
      if (volumeDuration.length > 0) {
        console.log('last talk duration: ' + (Math.max(...volumeDuration) - Math.min(...volumeDuration)))
        volumeDuration = []
      }
    }
    console.log('vol:' + volume) // here's the volume
  }, 1000)
}

function getAverageVolume (array) {
  var values = 0
  var average
  var length = array.length

  // get all the frequency amplitudes
  for (var i = 0; i < length; i++) {
    values += array[i]
  }

  average = values / length
  return average
}

module.exports = {
  startProcessingAudio: processAudio
}

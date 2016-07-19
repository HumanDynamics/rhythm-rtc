/* global easyrtc*/
const Sibilant = require('sibilant-webaudio')

function processAudio () {
  console.log('preparing to process audio...')

  var speakingEvents = new Sibilant(easyrtc.getLocalStream(), {passThrough: false})
  speakingEvents.bind('speaking', function () {
    document.querySelector('#box0').style.border = '5px solid #27ae60'
    console.log('speaking!')
  })
  speakingEvents.bind('stoppedSpeaking', function () {
    document.querySelector('#box0').style.border = '5px solid #555'
  })
}

module.exports = {
  startProcessingAudio: processAudio
}

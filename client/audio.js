/* global easyrtc*/
const Sibilant = require('sibilant-webaudio')

function processAudio (scope) {
  console.log('preparing to process audio....')
  var speakingEvents = new Sibilant(easyrtc.getLocalStream(), {passThrough: false})
  speakingEvents.bind('speaking', function () {
    document.querySelector('#box0').style.border = '5px solid #27ae60'
    console.log('speaking!')
  })

  speakingEvents.bind('stoppedSpeaking', function (data) {
    scope.app.service('utterances').create(
      {
        'participant': easyrtc.myEasyrtcid,
        'meeting': scope.roomName,
        'startTime': data.start.toISOString(),
        'endTime': data.end.toISOString()
      }).then(function (res) {
        console.log('speaking event recorded!', res)
        var start = new Date(res['startTime'])
        var end = new Date(res['endTime'])
        function pad (n) {
          return String('00' + n).slice(-2)
        }
        var duration = end - start
        console.log(end.getHours() + ':' + pad(end.getMinutes()) + ':' + pad(end.getSeconds()) + '- Duration: ' + duration + ' ms')
      }).catch(function (err) {
        console.log('ERROR:', err)
      })
    document.querySelector('#box0').style.border = '5px solid #555'
  })
}
module.exports = {
  startProcessing: processAudio
}

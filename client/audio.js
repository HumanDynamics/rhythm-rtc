/* global easyrtc*/
const Sibilant = require('sibilant-webaudio')
const io = require('socket.io-client')
const feathers = require('feathers-client')

var socket = io('https://rhythm-server.herokuapp.com', {
  'transports': [
    'websocket',
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling'
  ]
})

const app = feathers()
.configure(feathers.hooks())
.configure(feathers.socketio(socket))
.configure(feathers.authentication())

function processAudio (scope) {
  console.log('preparing to process audio...')
  app.authenticate({
    type: 'local',
    email: 'heroku-email',
    password: 'heroku-password'
  }).then(function (result) {
    console.log('auth result:', result)
    return socket.emit('meetingJoined', {
      participant: easyrtc.myEasyrtcid,
      name: easyrtc.myEasyrtcid,
      participants: scope.roomUsers,
      meeting: scope.roomName
    })
  }).then(function (result) {
    return app.service('participants').patch(easyrtc.myEasyrtcid, {
      consent: true,
      consentDate: new Date().toISOString()
    })
  }).then(function (result) {
    var speakingEvents = new Sibilant(easyrtc.getLocalStream(), {passThrough: false})
    speakingEvents.bind('speaking', function () {
      document.querySelector('#box0').style.border = '5px solid #27ae60'
      console.log('speaking!')
    })

    speakingEvents.bind('stoppedSpeaking', function (data) {
      app.service('utterances').create(
        {
          'participant': easyrtc.myEasyrtcid,
          'meeting': scope.roomName,
          'startTime': data.start.toISOString(),
          'endTime': data.end.toISOString()
        }).then(function (res) {
          console.log('speaking event recorded!', res)
          var start = new Date(res['startTime'])
          var end = new Date(res['endTime'])
          var elapsed = new Date(end - start)
          function pad (n) {
            return String('00' + n).slice(-2)
          }
          var duration = elapsed.getMinutes() + ':' + pad(elapsed.getSeconds())
          console.log(end.getHours() + ':' + pad(end.getMinutes()) + ':' + pad(end.getSeconds()) + '- Duration: ' + duration)
        }).catch(function (err) {
          console.log('ERROR:', err)
        })
      document.querySelector('#box0').style.border = '5px solid #555'
    })
  })
}
module.exports = {
  startProcessingAudio: processAudio
}

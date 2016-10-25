/* global easyrtc location prompt*/
const $ = require('jquery')
const _ = require('lodash')
const utils = require('./utils')
const audio = require('./audio')
const io = require('socket.io-client')
const feathers = require('feathers-client')
const face = require('./face')

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

var $scope = {
  roomName: null,
  roomUsers: [],
  needToCallOtherUsers: true,
  app: app
}

function callEverybodyElse (roomName, userList, selfInfo) {
  if ($scope.needToCallOtherUsers) {
    face.startTracking()
    console.log('need to call other users:', userList)
    _.forEach(userList, (user) => {
      console.log('trying to call user:', user)
      easyrtc.call(
        user.easyrtcid,
        function success (otherCaller, mediaType) {
          console.log('success', otherCaller, mediaType)
        },
        function failure (errorCode, errorMessage) {
          console.log('failure', errorCode, errorMessage)
        }
      )
    })
    $scope.needToCallOtherUsers = false
  }
}

function loginSuccess () {
  face.startTracking()
  console.log('login successful')
  $scope.roomUsers.push({participant: easyrtc.myEasyrtcid, meeting: $scope.roomName})
  console.log($scope.roomUsers)
  app.authenticate({
    type: 'local',
    email: 'heroku-email',
    password: 'heroku-password'
  }).then(function (result) {
    console.log('auth result:', result)
    return socket.emit('meetingJoined', {
      participant: easyrtc.myEasyrtcid,
      name: easyrtc.myEasyrtcid,
      participants: $scope.roomUsers,
      meetings: $scope.roomName,
      meeting: $scope.roomName,
      meetingUrl: location.href,
      consent: true,
      consentDate: new Date().toISOString()
    })
  }).catch(function (err) {
    console.log('ERROR:', err)
  }).then(function (result) {
    console.log('meeting result:', result)
    audio.startProcessing($scope)
  })
}

function getIdOfBox (boxNum) {
  return '#box' + boxNum
}

function init () {
  console.log('initializing RTC client...')
  easyrtc.dontAddCloseButtons()
  easyrtc.setRoomEntryListener(function (entry, roomName) {
    console.log('entered room!')
    $scope.needToCallOtherUsers = true
  })
  easyrtc.setRoomOccupantListener(callEverybodyElse)
  easyrtc.easyApp('rhythm.party',
                  'box0',
                  ['box1', 'box2', 'box3', 'box4'],
                  loginSuccess)
  joinRoom()
  easyrtc.setDisconnectListener(function () {
    easyrtc.showError('LOST-CONNECTION', 'Lost connection to signaling server')
  })
  easyrtc.setOnCall(function (easyrtcid, slot) {
    console.log('getConnection count=' + easyrtc.getConnectionCount())
    $scope.roomUsers.push({participant: easyrtcid, meeting: $scope.roomName})
    $(getIdOfBox(slot + 1)).css('visibility', 'visible')
  })
  easyrtc.setOnHangup(function (easyrtcid, slot) {
    setTimeout(function () {
      $(getIdOfBox(slot + 1)).css('visibility', 'hidden')
    }, 20)
  })

  $('#leaveRoomLink').click(function () {
    // call roomLeave handler
    easyrtc.leaveRoom($scope.roomName, function () {
      location.assign(location.href.substring(0, location.href.indexOf('?')))
    })
  })
}

function joinRoom () {
  $scope.roomName = utils.getParam('room')
  if ($scope.roomName === null || $scope.roomName === '' || $scope.roomName === 'null') {
    $scope.roomName = prompt('enter room name:')
    if (location.href.indexOf('?room=') === -1) {
      location.assign(location.href + '?room=' + $scope.roomName)
    } else {
      location.assign(location.href + $scope.roomName)
    }
  } else {
    easyrtc.joinRoom($scope.roomName)
    console.log('entered room: ' + $scope.roomName)
    $('#roomIndicator').html("Currently in room '" + $scope.roomName + "'")
    $('#leaveRoomLink').css('visibility', 'visible')
  }
}

module.exports = {
  initClient: init
}

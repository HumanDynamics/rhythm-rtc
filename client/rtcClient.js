/* global easyrtc location prompt*/
const $ = require('jquery')
const _ = require('lodash')
const utils = require('./utils')
const audio = require('./audio')
const viz = require('./charts')
const io = require('socket.io-client')
const feathers = require('feathers-client')
const cookie = require('js-cookie')
const face = require('./face')
// const easyrtc = require('easyrtc')

console.log('connecting to rhythm server:', process.env.SERVER_URL)

var socket = io(process.env.SERVER_URL, {
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
  user: "",
  needToCallOtherUsers: true,
  app: app,
  screenSize: 0
}

function callEverybodyElse (roomName, userList, selfInfo) {
  if ($scope.needToCallOtherUsers) {
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
    screenLogic()
  }
}

function loginSuccess () {
  console.log('login successful')
  // get or set user cookie!
  var userCookie = cookie.get('rtcuser')
  if (userCookie) {
    $scope.user = userCookie
    console.log('got old cookie')
  } else {
    cookie.set('rtcuser', easyrtc.myEasyrtcid, {expires: 30})
    console.log('made new cookie', cookie.get('rtcuser'))
    $scope.user = easyrtc.myEasyrtcid
  }
  console.log('$scope.user', $scope.user)
  $scope.roomUsers.push({participant: $scope.user, meeting: $scope.roomName})
  console.log($scope.roomUsers)
  app.authenticate({
    type: 'local',
    email: process.env.RHYTHM_SERVER_EMAIL,
    password: process.env.RHYTHM_SERVER_PASSWORD
  }).then(function (result) {
    console.log('auth result:', result)
    return socket.emit('meetingJoined', {
      participant: $scope.user,
      name: $scope.user,
      participants: $scope.roomUsers,
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
    viz.startMM($scope)
    face.startTracking($scope)
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
    console.log('called ', $scope.roomUsers)
    $(getIdOfBox(slot + 1)).css('display', 'unset')
    screenLogic()
    viz.updateMM($scope)
  })
  easyrtc.setOnHangup(function (easyrtcid, slot) {
    setTimeout(function () {
      $(getIdOfBox(slot + 1)).css('display', 'none')
      screenLogic()
      // need to update viz here and remove participant
      _.remove($scope.roomUsers, function (user) { return user.participant === easyrtcid })
      console.log('removed something? ', $scope.roomUsers)
      viz.updateMM($scope)
    }, 20)
  })

  $('#leaveRoomLink').click(function () {
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

function screenLogic () {
  // this is the  function that controls the sizing of remote callers on screen
  if ($scope.screenSize !== 0) {
    $('.remote').removeClass('m' + $scope.screenSize)
  }

  var newSize = 12 / (easyrtc.getConnectionCount())
  $('.remote').addClass('m' + newSize)
  $scope.screenSize = newSize
}

module.exports = {
  initClient: init
}

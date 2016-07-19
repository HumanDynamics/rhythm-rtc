/* global easyrtc location prompt*/
const $ = require('jquery')
const _ = require('lodash')
const utils = require('./utils')
const audio = require('./audio')

var $scope = {
  roomName: null,
  roomUsers: [],
  needToCallOtherUsers: true
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
  }
}

function loginSuccess () {
  console.log('login successful')
  $scope.roomUsers.push(easyrtc.myEasyrtcid)
  $('#box0').on('playing', function () {
    console.log('user box is playing...')
    audio.startProcessingAudio()
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
    $scope.roomUsers.push(easyrtcid)
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

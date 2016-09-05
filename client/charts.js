/* global easyrtc*/

const MM = require('./mm.js')
const _ = require('underscore')
const $ = require('jquery')

var mm = null
var mmWidth = 300
var mmHeight = 300
var $scope = {}

// just sums up values of the turns object.
// function get_total_transitions (turns) {
//   return _.reduce(_.values(turns), function (m, n) { return m + n }, 0)
// }

// transform to the right data to send to chart
function transformTurns (participants, turns) {
  console.log('transforming turns:', turns)

  // filter out turns not by present participants
  var filteredTurns = _.filter(turns, function (turn) {
    return _.contains(participants, turn.participant)
  })
  return filteredTurns
}

// update MM turns if it matches this hangout.
function maybeUpdateMMTurns (data) {
  console.log('mm data turns:', data)
  //
  if (data.meeting === $scope.roomName) {
    mm.updateData({participants: mm.data.participants,
      transitions: data.transitions,
    turns: transformTurns(mm.data.participants, data.turns)})
  }
}

// update MM participants if it matches this hangout.
// removes the local participants from the list.
function maybeUpdateMMParticipants (participantsChangedEvent) {
  console.log('maybe updating mm partcipants...', participantsChangedEvent)
  var participants = _.map($scope.roomUsers, function (p) { return p.participant })
  mm.updateData({participants: participants,
    transitions: mm.data.transitions,
  turns: mm.data.turns})
}

function startMeetingMediator (scope) {
  $scope = scope
  console.log('>> Starting meeting mediator...')

  if (!($('#meeting-mediator').is(':empty'))) {
    return
  }

  var participants = _.map($scope.roomUsers, function (p) { return p.participant })
  var localParticipantId = easyrtc.myEasyrtcid
  console.log('MM participants:', participants)
  mm = new MM({participants: participants,
    transitions: 0,
  turns: []},
    localParticipantId,
    mmWidth,
    mmHeight)
  mm.render('#meeting-mediator')
}

module.exports = {
  startMM: startMeetingMediator,
  updateMM: maybeUpdateMMParticipants,
  turnsMM: maybeUpdateMMTurns
}

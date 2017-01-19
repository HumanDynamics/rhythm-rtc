const MM = require('./mm.coffee').MeetingMediator
const _ = require('underscore')
const $ = require('jquery')

var mm = null
var mm_width = 300
var mm_height = 300
var $scope = {}

// just sums up values of the turns object.
function get_total_transitions(turns) {
  return _.reduce(_.values(turns), function(m, n){return m+n;}, 0);
}

// transform to the right data to send to chart
function transform_turns(participants, turns) {
  console.log("transforming turns:", turns);

  // filter out turns not by present participants
  var filtered_turns = _.filter(turns, function(turn){
    return _.contains(participants, turn.participant);
  });
  return filtered_turns;

}

// update MM turns if it matches this hangout.
function maybe_update_mm_turns(data) {
  console.log("mm data turns:", data)
  //
  if (data.meeting === $scope.roomName) {
    mm.updateData({participants: mm.data.participants,
                   transitions: data.transitions,
                   turns: transform_turns(mm.data.participants, data.turns)})
  }
}

// update MM participants if it matches this hangout.
// removes the local participants from the list.
function maybe_update_mm_participants(scope) {
  console.log('maybe updating mm partcipants...')
  var participants = _.map(scope.roomUsers, function (p) { return p.participant })
  mm.updateData({participants: participants,
                 transitions: mm.data.transitions,
                 turns: mm.data.turns})
}

var start_participant_listener = function () {
  console.log("starting listening for participants")
  var participantEvents = $scope.app.service('participantEvents')
  participantEvents.on('created', function (obj) {
    console.log("got a new participant event:", obj)
    console.log("roomname:", $scope.roomName)
    if (_.isEqual(obj.meeting, $scope.roomName)) {
      mm.updateData({
        participants: obj.participants,
        transitions: mm.data.transitions,
        turns: mm.data.turns
      })
    }
  })
}

var start_meeting_listener = function () {
  console.log("starting listening for participants -- 2")
  var meetings = $scope.app.service('meetings')
  meetings.on('patched', function (obj) {
    console.log("meeting got updated:", obj)
    console.log("roomname:", $scope.roomName)
    if (_.isEqual(obj._id, $scope.roomName)) {
      mm.updateData({
        participants: obj.participants,
        transitions: mm.data.transitions,
        turns: mm.data.turns
      })
    }
  })
}

function start_meeting_mediator (scope) {
  $scope = scope
  console.log('>> Starting meeting mediator...')

  if (!($('#meeting-mediator').is(':empty'))) {
    console.log("not starting a second MM...")
    return
  }

  var turns = $scope.app.service('turns')
  var participants = _.map($scope.roomUsers, function (p) {return p.participant})
  var localParticipantIds =  [$scope.user]
  console.log('MM participants:', participants)
  console.log("meeting mediator:", MM)
  mm = new MM({participants: participants,
               transitions: 0,
               turns: [],
               names: []},
              localParticipantIds,
              mm_width,
              mm_height)
  mm.render('#meeting-mediator');
  turns.on("updated", maybe_update_mm_turns);
  start_participant_listener()
  start_meeting_listener()
}

 module.exports = {
    startMM: start_meeting_mediator,
    updateMM: maybe_update_mm_participants
  }


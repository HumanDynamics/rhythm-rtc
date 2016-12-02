const Thumos = require('thumos')

function trackFace (scope) {

  console.log("starting to track facial movement!");

  var faceEvents = new Thumos('box0','videoOverlay',true)
  faceEvents.bind('faceMoving', function (data) {
    scope.app.service('faces').create(
      {
        'participant': scope.user,
        'meeting': scope.roomName,
        'timestamp': data.now.toISOString(),
        'start_time': data.start.toISOString(),
        'end_time': data.end.toISOString(),
        'face_delta': data.delta,
        'delta_array': data.array
      }).then(function (res) {
        console.log('face movement event is being emitted!!!', res)
      }).catch(function (err) {
        console.log('ERROR:', err)
      })
  })

}
module.exports = {
  startTracking: trackFace
}

const thumos = require('thumos')

/* global clm pModel Stats requestAnimFrame*/
function trackFace (scope) {
  var faceEvents = new Thumos('#userBox', '#videoOverlay', false)
  faceEvents.bind('faceMoving', function (data) {
    scope.app.service('face').create(
      {
        'participant': scope.user,
        'meeting': scope.roomName,
        'delta_array': data.array,
        'x_array': data.xArray,
        'y_array': data.yArray
      }
    ).catch(function (err) {
      console.log("couldnt create face thing", err)
    })
  })
}
module.exports = {
  startTracking: trackFace
}

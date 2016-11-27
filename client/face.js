const Thumos = require('thumos')

function trackFace (scope) {

  console.log("starting to track facial movement!");

  var faceEvents = new Thumos('box0','videoOverlay',true)
  faceEvents.bind('faceMoving', function (data) {
    console.log('face movement event is being emitted!!!')
    $('#data').html('<b>data:</b> <br> <br>start: ' + data.start.toISOString() + '<br>end: ' + data.end.toISOString() + '<br>delta_average: ' + data.delta)
  })

}
module.exports = {
  startTracking: trackFace
}

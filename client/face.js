/* global clm pModel Stats requestAnimFrame*/
function trackFace () {
  var video = document.getElementById('box0')
  var overlay = document.getElementById('overlay')
  var overlayCC = overlay.getContext('2d')
  var positions

  var ctrack = new clm.tracker({useWebGL: true})
  ctrack.init(pModel)

  var stats = new Stats()
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.top = '0px'
  document.getElementById('container').appendChild(stats.domElement)

  // start tracking
  ctrack.start(video)
  // start loop to draw face
  drawLoop()
  // print position data to console
  positionLoop()
  // print the position every 10 seconds??
  setInterval(function getDeltaPositions () {
    var deltaPositions = []
    var startPositions = positions
    var endPositions
    var startTime
    var endTime
    startTime = new Date()
    setTimeout(function deltas () {
      endPositions = positions
      endTime = new Date()
      for (var i = 0; i < startPositions.length; i++) {
        deltaPositions.push([endPositions[i][0] - startPositions[i][0], endPositions[i][1] - startPositions[i][1]])
      }
      console.log('start time:' + startTime.toISOString())
      console.log('end time:' + endTime.toISOString())
      console.log('delta positions array: ' + deltaPositions)
    }, 5000)
  }, 10000)

  function drawLoop () {
    requestAnimFrame(drawLoop)
    overlayCC.clearRect(0, 0, 400, 300)
    if (ctrack.getCurrentPosition()) {
      ctrack.draw(overlay)
    }
  }

  function positionLoop () {
    requestAnimFrame(positionLoop)
    positions = ctrack.getCurrentPosition()
  }

  // update stats on every iteration
  document.addEventListener('clmtrackrIteration', function (event) {
    stats.update()
  }, false)
}
module.exports = {
  startTracking: trackFace
}

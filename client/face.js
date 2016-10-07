/* global clm pModel Stats requestAnimFrame*/
function trackFace () {
  var vid = document.getElementById('box0')
  var overlay = document.getElementById('overlay')
  var overlayCC = overlay.getContext('2d')

  var ctrack = new clm.tracker({useWebGL: true})
  ctrack.init(pModel)

  var stats = new Stats()
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.top = '0px'
  document.getElementById('container').appendChild(stats.domElement)

  // start video
  vid.play()
  // start tracking
  ctrack.start(vid)
  // start loop to draw face
  drawLoop()
  // print position data to console
  positionLoop()

  function drawLoop () {
    requestAnimFrame(drawLoop)
    overlayCC.clearRect(0, 0, 400, 300)
    // psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4)
    if (ctrack.getCurrentPosition()) {
      ctrack.draw(overlay)
    }
  }

  function positionLoop () {
    requestAnimFrame(positionLoop)
    var positions = ctrack.getCurrentPosition()
    console.log('positions array: ' + positions)
  }

  // update stats on every iteration
  document.addEventListener('clmtrackrIteration', function (event) {
    stats.update()
  }, false)
}
module.exports = {
  startTracking: trackFace
}

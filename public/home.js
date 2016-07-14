$('#quickRoom').on('click', function () {
  var randomRoom = Math.floor(Math.random() * (Math.pow(2, 30) - 1 + 1)) + 1
  window.location.href = '/index.html?room=' + randomRoom
})

var video = document.querySelector('#bgvid')

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia

if (navigator.getUserMedia) {
  navigator.getUserMedia({video: true}, handleVideo, videoError)
}

function handleVideo (stream) {
  video.src = window.URL.createObjectURL(stream)
}

function videoError (e) {
    $('#bgvid').css('visibility', 'visible')
}

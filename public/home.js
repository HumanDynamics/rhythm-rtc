$('#quickRoom').on('click', function () {
  var randomRoom = Math.floor(Math.random() * (Math.pow(2, 30) - 1 + 1)) + 1
  window.location.href = '/index.html?room=' + randomRoom
})

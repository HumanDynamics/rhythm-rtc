const domready = require('domready')
const rtcClient = require('./rtcClient')
const utils = require('./utils')
require('materialize')

domready(function () {
  var roomName = utils.getParam('room')
  $('#meeting-id').html(roomName)

  window.multiple = false
  $('#multiple-checkbox').click(function () {
    window.multiple = !window.multiple
    console.log("multiple is now:", window.multiple)
  })

  $('.modal').modal({complete: function () {
    console.log("modal ended", rtcClient.initClient)
    rtcClient.initClient()
  }})
  $('.modal').modal('open')
//  window.initClient = rtcClient.initClient
})

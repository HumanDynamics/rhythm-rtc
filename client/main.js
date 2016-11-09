const domready = require('domready')
const rtcClient = require('./rtcClient')

domready(function () {
    rtcClient.initClient()
})

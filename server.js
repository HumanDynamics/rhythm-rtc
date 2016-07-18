// Load required modules
const http = require('http')
const express = require('express')
const io = require('socket.io')
const easyrtc = require('easyrtc')
const path = require('path')
const browserify = require('browserify-middleware')
const app = express()

browserify.settings.development('basedir', __dirname)
app.get('/js/main.js', browserify('./client/main.js'))
app.use(express.static(path.join(__dirname, '/public/')))

let webServer = http.createServer(app).listen(process.env.PORT)

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer, {'log level': 1})

easyrtc.setOption('logLevel', 'debug')

// Setting up ICE STUN/TURN servers
// Currently using google STUN servers and no TURN servers

var iceServers = [
  {'url': 'stun:stun.l.google.com:19305'},
  {'url1': 'stun:stun.l.google.com:19305'},
  {'url2': 'stun:stun.l.google.com:19305'},
  {'url3': 'stun:stun.l.google.com:19305'},
  {'url4': 'stun:stun.l.google.com:19305'},
  {'url': 'stun:stun.l.google.com:19305'}
]

easyrtc.setOption('appIceServers', iceServers)

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on('easyrtcAuth', function (socket, easyrtcid, msg, socketCallback, callback) {
  easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function (err, connectionObj) {
    if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
      callback(err, connectionObj)
      return
    }

    connectionObj.setField('credential', msg.msgData.credential, {'isShared': false})

    console.log('[' + easyrtcid + '] Credential saved!', connectionObj.getFieldValueSync('credential'))

    callback(err, connectionObj)
  })
})

// To test, lets print the credential to the console for every room join!
easyrtc.events.on('roomJoin', function (connectionObj, roomName, roomParameter, callback) {
  console.log('[' + connectionObj.getEasyrtcid() + '] Credential retrieved!', connectionObj.getFieldValueSync('credential'))
  easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback)
})

// Start EasyRTC server
easyrtc.listen(app, socketServer, null, function (err, rtcRef) {
  if (err) {
    console.log('err:', err)
  }

  console.log('Initiated')

  rtcRef.events.on('roomCreate', function (appObj, creatorConnectionObj, roomName, roomOptions, callback) {
    console.log('roomCreate fired! Trying to create: ' + roomName)
    appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback)
  })
})

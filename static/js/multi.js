var maxCALLERS = 4;
var numVideoOBJS = maxCALLERS+1;
var roomName;

var needToCallOtherUsers;

function callEverybodyElse(roomName, userList, selfInfo) {
  var easyrtcid
  if (needToCallOtherUsers) {
    for (easyrtcid in userList) {
      easyrtc.call(
        easyrtcid,
        function success (otherCaller, mediaType) {
          console.log('success: ', otherCaller, mediaType);
        },
        function failure(errorCode, errorMessage) {
          console.log('failure: ', errorCode, errorMessage);
        }
      );
    }
    needToCallOtherUsers = false;
  }
}






/* function callEverybodyElse(roomName, otherPeople) {
 *   console.log('calling everybody else...')
 *   //easyrtc.setRoomOccupantListener(null); // so we're only called once.
 * 
 *   var list = [];
 *   var connectCount = 0;
 *   for(var easyrtcid in otherPeople ) {
 *     list.push(easyrtcid);
 *   }
 *   //
 *   // Connect in reverse order. Latter arriving people are more likely to have
 *   // empty slots.
 *   //
 *   function establishConnection(position) {
 *     console.log('established connection!')
 *     function callSuccess() {
 *       connectCount++;
 *       if( connectCount < maxCALLERS && position > 0) {
 *         establishConnection(position-1);
 *       }
 *     }
 *     function callFailure(errorCode, errorText) {
 *       easyrtc.showError(errorCode, errorText);
 *       if( connectCount < maxCALLERS && position > 0) {
 *         establishConnection(position-1);
 *       }
 *     }
 *     easyrtc.call(list[position], callSuccess, callFailure);
 * 
 *   }
 *   if( list.length > 0) {
 *     establishConnection(list.length-1);
 *   }
 * }*/

function loginSuccess() {
  console.log('login successful');
  document.getElementById('box0').addEventListener('playing',function(){
  processAudio();
    });
}

function getIdOfBox(boxNum) {
  return "box" + boxNum;
}


function init() {
  easyrtc.dontAddCloseButtons();
  easyrtc.setRoomEntryListener(function(entry, roomName) {
    needToCallOtherUsers = true;
  });
  easyrtc.setRoomOccupantListener(callEverybodyElse);
  easyrtc.easyApp("rhythm.party", "box0", ["box1", "box2", "box3", "box4"], loginSuccess);
  joinRoom();

  easyrtc.setDisconnectListener( function() {
    easyrtc.showError("LOST-CONNECTION", "Lost connection to signaling server");
  });
  easyrtc.setOnCall( function(easyrtcid, slot) {
    console.log("getConnection count="  + easyrtc.getConnectionCount() );
    document.getElementById(getIdOfBox(slot+1)).style.visibility = "visible";
  });
  easyrtc.setOnHangup(function(easyrtcid, slot) {
    setTimeout(function() {
      document.getElementById(getIdOfBox(slot+1)).style.visibility = "hidden";
    },20);
  });

  document.getElementById('leaveRoomLink').addEventListener("click", function(){
  //call roomLeave handler
    easyrtc.leaveRoom(roomName,function(){
      location.assign(location.href.substring(0,location.href.indexOf('?')));
    });
  });
}

function joinRoom(){
  roomName = getParam('room');
  if(roomName === null || roomName === '' || roomName === 'null'){
    roomName = prompt('enter room name:');
    if(location.href.indexOf('?room=') === -1){
      location.assign(location.href+"?room="+roomName);
    }
    else {
      location.assign(location.href+roomName);
    }
  }
  else{
      easyrtc.joinRoom(roomName);
      console.log("entered room: "+roomName);
      document.querySelector('#roomIndicator').innerHTML = 'Currently in room \''+roomName+'\'';
      document.getElementById('leaveRoomLink').style.visibility = "visible";
  }
}

function processAudio(){
  var aCtx = new AudioContext();
  var analyser = aCtx.createAnalyser();
  var whosVideo = document.querySelector("#box0");
  var whosTalking = document.getElementById("box0Talk");
  var volumeDuration = [];
  var audioSource = aCtx.createMediaStreamSource(easyrtc.getLocalStream());
  audioSource.connect(analyser);
  console.log("init process audio");
  setInterval(function(){
    // get the average, bincount is fftsize / 2
    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var volume = getAverageVolume(array);
    var threshold = 20;

    if(volume > threshold){
      whosTalking.innerHTML = "you're talking!";
      volumeDuration.push(whosVideo.currentTime);
    }
    else{
      whosTalking.innerHTML = "you are not talking!";
      if(volumeDuration.length > 0){
        console.log("last talk duration: " + (Math.max(...volumeDuration) - Math.min(...volumeDuration)));
        volumeDuration = [];
      }
    }
    console.log('vol:' + volume); //here's the volume
  },1000);
}

function getAverageVolume(array) {
  var values = 0;
  var average;
  var length = array.length;

  // get all the frequency amplitudes
  for (var i = 0; i < length; i++) {
    values += array[i];
  }

  average = values / length;
  return average;
}

//not mine
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

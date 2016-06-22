var raCtx;
var ranalyser;
var remoteAudio;
var laCtx;
var lanalyser;
var localAudio;
var localVolumeDuration = [];
var remoteVolumeDuration = [];
var localTalking;
var remoteTalking;

  easyrtc.setStreamAcceptor( function(callerEasyrtcid, stream) {
        var video = document.getElementById('caller');
        easyrtc.setVideoObjectSrc(video, stream);
        raCtx = new AudioContext();
        ranalyser = raCtx.createAnalyser();
        remoteAudio = raCtx.createMediaStreamSource(stream);
        remoteAudio.connect(ranalyser);
        // analyser.connect(aCtx.destination);
        process_audio("remote",ranalyser,video,remoteTalking,remoteVolumeDuration);
    });

     easyrtc.setOnStreamClosed( function (callerEasyrtcid) {
        easyrtc.setVideoObjectSrc(document.getElementById('caller'), "");
    });


    function my_init() {

        localTalking = document.querySelector("#localTalking");
        remoteTalking = document.querySelector("#remoteTalking");
        easyrtc.setRoomOccupantListener(roomListener);
        var connectSuccess = function(myId) {
            console.log("My easyrtcid is " + myId);
        }
        var connectFailure = function(errorCode, errText) {
            console.log(errText);
        }
        easyrtc.initMediaSource(
              function(){        // success callback
                  var selfVideo = document.getElementById("self");
                  easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
                  easyrtc.connect("the_room_where_it_happens", connectSuccess, connectFailure);

                    laCtx = new AudioContext();
                    lanalyser = laCtx.createAnalyser();
                    localAudio = laCtx.createMediaStreamSource(easyrtc.getLocalStream());
                    localAudio.connect(lanalyser);
                    // analyser.connect(aCtx.destination);
                    process_audio("local",lanalyser,selfVideo,localTalking,localVolumeDuration);
              },
              connectFailure
        );
     }


    function roomListener(roomName, otherPeers) {
        var otherClientDiv = document.getElementById('otherClients');
        while (otherClientDiv.hasChildNodes()) {
            otherClientDiv.removeChild(otherClientDiv.lastChild);
        }
        for(var id in otherPeers) {
          performCall(id);
        }
    }


    function performCall(easyrtcid) {
        easyrtc.call(
           easyrtcid,
           function(easyrtcid) { console.log("completed call to " + easyrtcid);},
           function(errorCode, errorText) { console.log("err:" + errorText);},
           function(accepted, bywho) {
              console.log((accepted?"accepted":"rejected")+ " by " + bywho);
           }
       );
    }

    function process_audio(user,analyser,whosVideo, whosTalking, volumeDuration){
    setInterval(function(){
        // get the average, bincount is fftsize / 2
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var volume = getAverageVolume(array);
        var threshold = 20;

        if(volume > threshold){
          whosTalking.innerHTML = user + " user is talking!";
          volumeDuration.push(whosVideo.currentTime);
        }
        else{
        whosTalking.innerHTML = user + " user is not talking!";
        if(volumeDuration.length > 0){
          console.log("last "+user+" talk duration: " + (Math.max(...volumeDuration) - Math.min(...volumeDuration)));
          volumeDuration = [];
        }
        }
         console.log(user +'vol:' + volume); //here's the volume
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
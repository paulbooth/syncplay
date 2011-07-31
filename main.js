/*
 * This is the audio element for the page. We use this to play audio.
 */
var audio;
var socket;
var startTime;
var offset;
function init() {
    initSocket();
    initAudioElement();
}

function initSocket() {
    socket = new io.Socket(window.location.hostname, {port: 8080});

    socket.connect();

    socket.on('connect', function(evt) {
		  console.log(evt);
          syncClocks();
	      });
    socket.on('message', function(evt) {
		  if ('src' in evt) {
		      audio.setAttribute('src', evt.src);
		  } else if ('play' in evt) {
		      setTimeout(play, evt.play);
		  } else if ('latencyTest' in evt) {
		      console.log('latencyTest');
		      console.log(evt.latencyTest);
		      socket.send(
			  {'latencyTest':
			       new Date().getTime() - evt.latencyTest
			   });
		  } else if ('serverTime' in evt) {
            if (startTime == null) {
                throw "clock sync not run correctly upon server connection, please try again?"
            }
            var serverTime = evt.serverTime;
            var oneWayTime = ((new Date()).getTime() - startTime)/2;
            offset = serverTime - (oneWayTime + startTime)
          }
	      });
    socket.on('disconnect', function() {
		  console.log('client disconnect');
	      });
}

function initAudioElement() {
    audio = document.createElement('audio');
}

function play() {
    audio.play();
}

function syncClocks(){
    startTime = (new Date()).getTime();
}

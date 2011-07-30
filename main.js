/*
 * This is the audio element for the page. We use this to play audio.
 */
var audio;

function init() {
    initSocket();
    initAudioElement();
}

function initSocket() {
    var socket = new io.Socket(window.location.hostname, {port: 8080});

    socket.connect();

    socket.on('connect', function(evt) {
		  console.log(evt);
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
// Utilities
var DEBUG = true;
function print(entry) {
    return log(entry);
}
function log(entry) {
    if (DEBUG) {
	console.log(entry);
    }
}
function now() {
  return (new Date()).getTime();
}

function at(datetime) {
  return datetime - now();
}

// Init

$(function() {
  log('starting init...');
  var audioElement, socket, startTime, offset;

  audioElement = document.createElement('audio');

  log('connecting to ' + window.location)
  socket = io.connect(window.location);//'http://' + window.location.hostname + ':8080');
  log(window.location.hostname);

  socket.on('connect', function(data) {
	log('connected; starting clock sync');
    startTime = now();
    socket.emit('startClockSync');
  });

  socket.on('src', function(audioSrc) {
    log('audio src received:' + audioSrc);
    audioElement.setAttribute('src', audioSrc);
    audioElement.load();
  });

  socket.on('clockSyncServerTime', function(clockSyncServerTime) {
    log('server clock sync received; setting offset');
    if (startTime == null) {
      throw "clock sync failed: startTime didn't get set.";
    }
    offset = clockSyncServerTime - now()/2 + startTime/2;
  });

  socket.on('play', function(playTime) {
    log('received play message');
    setTimeout(function() { audioElement.play(); },
      at(playTime + offset));
  });

  socket.on('message', function(data) {
    
  });
  socket.on('stop', function(data) {
	  log('stopping');
	  	audioElement.stop();
	window.location.href = window.location.href;
      });
  socket.on('disconnect', function() {
    log('client disconnect');
  });
  
  $('#play').click(function() {
    log('sending play message');
	  socket.emit('start');
  });
  $('#stop').click(function() {
	  log('sending stop message');
	  socket.emit('stopall');
      });
});

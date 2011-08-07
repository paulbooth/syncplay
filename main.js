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

  socket = io.connect();//'http://' + window.location.hostname + ':8080');
  log(window.location.hostname);

  socket.on('connect', function(data) {
	log('connected; starting clock sync');
    startTime = now();
    socket.json.send({'startClockSync': true});
  });

  socket.on('message', function(data) {
    if ('src' in data) {
	  log('audio src received:' + data.src);
      audioElement.setAttribute('src', data.src);
      audioElement.load();
    } else if ('play' in data) {
	  log('received play message');
      setTimeout(function() { audioElement.play(); },
				 at(data.play + offset));
    } else if ('clockSyncServerTime' in data) {
	  log('server clock sync received; setting offset');
      if (startTime == null) {
        throw "clock sync failed: startTime didn't get set.";
      }
      offset = data.clockSyncServerTime - now()/2 + startTime/2;
    }
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
	socket.json.send({'start': true});
  });
  $('#stop').click(function() {
	  log('sending stop message');
	  socket.emit('stopall');
      });
});

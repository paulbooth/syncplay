// Utilities

function now() {
  return (new Date()).getTime();
}

function at(datetime) {
  return datetime - now();
}

// Init

$(function() {
  console.log('starting init...');
  var audioElement, socket, startTime, offset;

  audioElement = document.createElement('audio');

  console.log(1);
  socket = new io.connect('http://' + window.location.hostname + ':8080');
  console.log(window.location.hostname);

  socket.on('connect', function(data) {
	console.log('connected; starting clock sync');
    startTime = now();
    socket.send({'startClockSync': true});
  });

  socket.on('message', function(data) {
    if ('src' in data) {
	  console.log('audio src received');
      audioElement.setAttribute('src', data.src);
    } else if ('play' in data) {
	  console.log('received play message');
      setTimeout(function() { audioElement.play(); },
				 at(data.play + offset));
    } else if ('clockSyncServerTime' in data) {
	  console.log('server clock sync received; setting offset');
      if (startTime == null) {
        throw "clock sync failed: startTime didn't get set.";
      }
      var serverTime = data.clockSyncServerTime,
          oneWayTime = (now() - startTime)/2;
      offset = serverTime - (oneWayTime + startTime);
    }
  });

  socket.on('disconnect', function() {
    console.log('client disconnect');
  });
  
  $('#play').click(function() {
    console.log('sending play message');
	socket.send({'start': true});
  });
});

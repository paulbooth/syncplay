$(function() {
  console.log('starting init...');
  var songAudio, socket, startTime, offset = 0, numberSyncs = 0;

  songAudio = new Audio();

  console.log('connecting to ' + window.location)
  socket = io.connect(window.location);//'http://' + window.location.hostname + ':8080');

  socket.on('connect', function(data) {
	  console.log('connected; starting clock sync');
  });

  function startSync() {
    startTime = Date.now();
    socket.emit('startClockSync');
  };

  socket.on('src', function(audioSrc) {
    console.log('audio src received:' + audioSrc);
    songAudio.setAttribute('src', audioSrc);
    songAudio.load();
    setInterval(startSync, 1000);
  });

  socket.on('clockSyncServerTime', function(clockSyncServerTime) {
    console.log('server clock sync received ' + clockSyncServerTime + '; setting offset');
    if (startTime == null) {
      throw "clock sync failed: startTime didn't get set.";
    }
    var newOffset = clockSyncServerTime - Date.now()/2 - startTime/2;
    var oldOffset = offset;
    
    offset = (offset * numberSyncs + newOffset)/(numberSyncs + 1);
    numberSyncs++;
    console.log('offset: ' + offset);
    $('#info').text( 'offset: ' + offset + ' old: ' + (newOffset - oldOffset) + ' cumulative: ' + (offset - oldOffset));
    var max_badness = 3;
    var redness = Math.floor(Math.min(Math.abs(offset - oldOffset), max_badness)/max_badness * 255);
    $('body').css('background-color', 'rgb(' + redness + ',' + (255-redness)  + ',0)');
  });

  socket.on('play', function(playTime) {
    console.log('received play message');
    setTimeout(function() { songAudio.play(); },
      (playTime + offset));
  });

  // socket.on('message', function(data) {
  //   // not used.
  // });

  socket.on('stop', function(stopTime) {
	  console.log('stopping');
	  setTimeout(function() { songAudio.pause(); },
      (stopTime + offset));
	  // window.location.href = window.location.href;
  });

  socket.on('disconnect', function() {
    console.log('client disconnect');
  });
  
  $('#play').click(function() {
    console.log('sending play message');
	  socket.emit('start');
  });
  $('#stop').click(function() {
	  console.log('sending stop message');
	  socket.emit('stopall');
  });

});

var songAudio, socket, startTime, offset, numberSyncs = 0, maxNumberSyncs = 20, offsets = [], roundtrips = [], roundtrip;
$(function() {
  console.log('starting init...');

  songAudio = new Audio();
  songAudio.addEventListener('canplaythrough', function() { 
     $('#title').text("TEST READY.");
  }, false);

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
    setTimeout(function() {
      setInterval(startSync, 500);
    }, 1000);    
  });

  socket.on('clockSyncServerTime', function(clockSyncServerTime) {
    var receiveTime = Date.now();
    console.log('server clock sync received ' + clockSyncServerTime + '; setting offset');
    if (startTime == null) {
      throw "clock sync failed: startTime didn't get set.";
    }
    var newOffset = clockSyncServerTime - receiveTime;
    offsets.push(newOffset);
    roundtrips.push(receiveTime - startTime);
    if (offsets.length > maxNumberSyncs) {
      offsets.shift();
      roundtrips.shift();
    }
    // var oldOffset = offset;
    // if (offset == undefined) {
    //   offset = newOffset
    // } else {
    //   offset = (offset *.75 + newOffset * .25);
    // }
    // numberSyncs++;
    offset = offsets.reduce(function(a, b) { return a + b }) / offsets.length;
    // console.log('offset: ' + offset);
    $('#info').text( 'offset: ' + offset + ' offsets:' + offsets);
    roundtrip = roundtrips.reduce(function(a, b) { return a + b }) / roundtrips.length;
    // console.log('offset: ' + offset);
    $('#info0').text( 'roundtrip: ' + roundtrip + ' roundtrips:' + roundtrips);
    // var max_badness = 3;
    // var redness = Math.floor(Math.min(Math.abs(offset - oldOffset), max_badness)/max_badness * 255);
    // $('#info').css('background-color', 'rgb(' + redness + ',' + (255-redness)  + ',0)');
  });

  socket.on('play', function(timeData) {
    // console.log('received play message');
    // setTimeout(function() { 
    //   songAudio.play(); 
    //   startFlash();
    // },
    //   (playTime + offset));
    console.log('play');
    console.log(timeData);
    var i = Date.now();
    songAudio.currentTime = timeData.playTime + roundtrip/1000;
    songAudio.play();
    var d = Date.now(); 
    $('#info1').text('calc\'d offset: ' + (timeData.serverTime - i));
    $('#info2').text('offset: ' + offset + ' roundtrip: ' + roundtrip);
    $('#info3').text('time to play: ' + (d-i));
  });
  socket.on('playnow', function(timeData) {
    // console.log('received play message');
    // setTimeout(function() { 
    //   songAudio.play(); 
    //   startFlash();
    // },
    //   (playTime + offset));
    console.log('play');
    console.log(timeData);
    var i = Date.now();
    songAudio.currentTime = timeData.playTime;
    songAudio.play();
    var d = Date.now(); 
    $('#info1').text('calc\'d offset: ' + (timeData.serverTime - i));
    $('#info2').text('offset: ' + offset + ' roundtrip: ' + roundtrip);
    $('#info3').text('time to play: ' + (d-i));
  });

  // socket.on('message', function(data) {
  //   // not used.
  // });

  socket.on('stop', function(stopTime) {
	  // console.log('stopping');
	  // setTimeout(function() { songAudio.pause(); },
   //    (stopTime + offset));
    songAudio.pause();
    songAudio.currentTime = 0;
	  // window.location.href = window.location.href;
  });

  socket.on('disconnect', function() {
    console.log('client disconnect');
  });
  
  $('#play').click(function() {
    console.log('sending play message');
	  socket.emit('start');
  });
  $('#playnofancy').click(function() {
    console.log('sending playnofancy message');
    socket.emit('startnow');
  });
  $('#stop').click(function() {
	  console.log('sending stop message');
	  socket.emit('stopall');
  });

  function startFlash() {
    var black = false;
    setInterval(function() {
      $('body').css('background-color', black ? 'black' : 'white');
      black = !black;
    }, 500);
  }

});

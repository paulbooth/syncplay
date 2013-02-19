$(function() {
  var socket = io.connect(window.location);
  var startTime = null;

  socket.on('connect', function(data) {
    console.log('connected; starting clock sync');
    startTime = Date.now();
    socket.json.send({'startClockSync': true});
  });
})
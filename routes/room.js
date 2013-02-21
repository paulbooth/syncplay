/*
 * GET home page.
 */

var trochee = require('../utilities/trochee')

exports.index = function(req, res){
  res.redirect('/' + trochee.getRandomTrocheeString(2));
};

/*
 * GET room page
 */
var rooms = {};
var io;

var audioSrc = 'audio/boo.mp3';

// The function for a socket connecting to a room
function connection_function(socket) {
  console.log("connected to  " + socket.namespace.name);
  socket.emit('src', audioSrc);

  function playAll() {
    io.of(socket.namespace.name).emit('play', {playTime: Math.random() * 230, serverTime: Date.now()});
  }
  function playAllNow() {
    io.of(socket.namespace.name).emit('playnow', {playTime: Math.random() * 230, serverTime: Date.now()});
  }
  function playAllTimout() {
    io.of(socket.namespace.name).emit('playtimeout', {playTime: Math.random() * 230, serverTime: Date.now()});
  }

  socket.on('startClockSync', function(data) {
    console.log('syncing clock');
    socket.volatile.emit('clockSyncServerTime', Date.now());
  });

  socket.on('start', function() {
    console.log('playing music');
    setTimeout(playAll, 1000);
  });
  socket.on('startnow', function() {
    console.log('playing music');
    setTimeout(playAllNow, 1000);
  });
  socket.on('starttimeoutplay', function() {
    console.log('playing music');
    setTimeout(playAllTimeout, 1000);
  });

  socket.on('message', function(data) {
    // should not be used.
  });

  socket.on('stopall', function(client) {
    console.log('stop all sockets');
    io.of(socket.namespace.name).emit('stop', Date.now() + 2000);
  });

  socket.on('disconnect', function () {
    console.log("Disconnected. from " + socket.namespace.name);
  });
}

exports.room = function(req, res) {
  // make sure they set up the io
  if (!io) {
    console.log("We have no sockets.");
    return res.send("No sockets set up in the server. Come back later or whatever.");
  }

  var roomid = req.params.roomid;
  if(!rooms.hasOwnProperty(roomid)) {
    rooms[roomid] = io.of('/' + roomid);
    rooms[roomid].on('connection', connection_function);
    rooms[roomid].connected_users = {};
  }
  res.render('index.jade');
};

exports.setServer = function(server) {
  io = require('socket.io').listen(server);
  io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
  });
  console.log('io set.');
}
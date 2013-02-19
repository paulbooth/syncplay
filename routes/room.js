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
  socket.json.send({'src': audioSrc});

  socket.on('message', function(data) {
      
                console.log(data);
                if ('startClockSync' in data) {
            console.log('syncing clock');
            socket.json.send({'clockSyncServerTime': Date.now()});
                } else if ('start' in data) {
            console.log('playing music');
            io.of(socket.namespace.name).json.send({'play': Date.now() + 5000});
                }
    });
  socket.on('disconnect', function () {
    console.log("Disconnected. from " + socket.namespace)
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
}
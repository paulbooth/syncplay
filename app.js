var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express()
  , server = http.createServer(app);

// Utilities
var networkIP = require('./utilities/networkIP');

// Routes
var room = require('./routes/room');

// instantiate routes dependencies
room.setServer(server);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  // app.use(express.cookieParser(process.env.SECRET || 'fake_secret'));
  // app.use(express.session());
  app.use(express.static(path.join(__dirname, 'public')));
  // app.use(Facebook.middleware({ appId: process.env.APP_ID, secret: process.env.APP_SECRET }));
  app.use(app.router);
});

app.configure('development', function(){
  console.log('development...');
  try {
    networkIP.printIP(app.get('port'));
  } catch (e) {
    console.error("couldn't get IP. oh well.");
    console.log(e);
  }
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
});
  
server.listen(app.get('port'), function(){
  console.log("Express server listening.");
});

app.get('/:roomid', room.room);

app.get('/', room.index);

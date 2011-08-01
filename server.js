var http = require('http'),
io = require('socket.io'),
path = require('path'),
paperboy = require('paperboy');

var getNetworkIP = (function () {
  var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;

  var exec = require('child_process').exec;
  var cached;    
  var command;
  var filterRE;

  switch (process.platform) {
    // TODO: implement for OSs without ifconfig command
  case 'darwin':
    command = 'ifconfig';
    filterRE = /\binet\s+([^\s]+)/g;
    // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
    break;
  default:
    command = 'ifconfig';
    filterRE = /\binet\b[^:]+:\s*([^\s]+)/g;
    // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
    break;
  }

  return function (callback, bypassCache) {
    // get cached value
    if (cached && !bypassCache) {
      callback(null, cached);
      return;
    }
    // system call
    exec(command, function (error, stdout, sterr) {
      var ips = [];
      // extract IPs
      var matches = stdout.match(filterRE);
      // JS has no lookbehind REs, so we need a trick
      for (var i = 0; i < matches.length; i++) {
        ips.push(matches[i].replace(filterRE, '$1'));
      }

      // filter BS
      for (var i = 0, l = ips.length; i < l; i++) {
        if (!ignoreRE.test(ips[i])) {
          //if (!error) {
          cached = ips[i];
          //}
          callback(error, ips[i]);
          return;
        }
      }
      // nothing found
      callback(error, null);
    });
  };
})();

getNetworkIP(function (error, ip) {
  console.log(ip);
  if (error) {
    console.log('error:', error);
  } else {
    runServer(ip);
  }
}, true);

function runServer(ip) {
  console.log('ip = ', ip);
  var audioSrc = 'audio/test.mp3';
  var clients = [];
  var server = http.createServer(function(req, res) {
    paperboy.deliver(path.dirname(__filename), req, res);
  });

  server.listen(8080);

  var socket = io.listen(server);
  socket.on('connection', function(client) {
    console.log('client connect.');
    client.send({'src': audioSrc});
    clients.push(client);
    client.on('message', function(data) {
      if ('startClockSync' in data) {
	console.log('syncing clock');
	client.send({'clockSyncServerTime': (new Date()).getTime()});
      } else if ('start' in data) {
	console.log('playing music');
	start();
      }
    });
  });

  function seconds(n) {
    return n * 1000;
  }

  function start() {
    clients.forEach(function(client) {
      client.send({'play': (new Date()).getTime() + seconds(5)});
    });
  }
  console.log('awesome. it\'s up.');
}

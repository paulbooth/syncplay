var http = require('http'),
io = require('socket.io'),
path = require('path'),
paperboy = require('paperboy');

var audioSrc = 'audio/test.mp3';
var startTimeMax = 5000;
var startTime = startTimeMax;
var startTimeout;
var countDownTimeout;
var clients = [];
var server = http.createServer(function(req, res) {
    paperboy.deliver(path.dirname(__filename), req, res);
    });

server.listen(8080, '192.168.2.4');

var socket = io.listen(server);
socket.on('connection', function(client) {
	      client.send({'src': audioSrc});
	      clients.push(client);
	      startTime = startTimeMax;
	      clearTimeout(countDownTimeout);
	      client.send({'latencyTest': new Date().getTime()});
	      startCountDown();
	      client.on('message', function(data) {
			    if ('latencyTest' in data) {
				client.latency = data.latencyTest;
			    }
			});
	  });
function start() {
    var date = new Date();
    var curtime = date.getTime();
    var goTime = 5000 + curtime;
    for (var i = 0; i < clients.length; i++) {
	clients[i].send({'play': goTime - new Date().getTime() -
			 clients[i].latencyTest});
    }
}
console.log('awesome. it\'s up.');
function startCountDown() {
    startTime -= 1000;
    console.log('t:'+startTime);
    if (startTime > 0) {
	countDownTimeout = setTimeout(startCountDown, 1000);
    } else {
	start();
    }
}

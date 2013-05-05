var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

io.set('log level', 1);

server.listen(5000);

var links = {};

app.use("/", express.static(__dirname + '/public'));
var genKey = function () {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyz';
	var length = 5;
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];

    if (typeof links[result] == 'object') {
    	for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
}



io.sockets.on('connection', function (socket) {
	socket.on('identify', function (d) {
		console.log('Ident recieved: '+((d.mobile)?'mobile':'desktop'));
		if (d.mobile && d.key != '') {
			// Keyed mobile
			if (links[d.key] != null) {
				links[d.key].p = socket;
				console.log('Complete link established :D');
				links[d.key].d.emit('clearQR', {});
				links[d.key].d.emit('prepareDesk', {});
				links[d.key].p.emit('prepareMob', {});
				links[d.key].p.on('motiondata', function (e) {
					links[d.key].d.emit('motion', e);
				});

				//console.log(links[d.key]);
			} else {
				// Outdated/wrong link
				socket.emit('problem', {e: 'You clicked an outdated/wrong link!'});
			}

		} else if (!d.mobile) {
			// Desktop
			var key = genKey();
			links[key] = {d: socket, p: null, key: key};
			socket.emit('generateQR', {hash: '#'+key});
			// Desktop
		}
	});
	socket.emit('connected', {});
	

});
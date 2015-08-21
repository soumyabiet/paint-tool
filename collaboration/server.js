var app = require('/usr/local/lib/node_modules/express')();
var http = require('http').Server(app);
var io = require('/usr/local/lib/node_modules/socket.io')(http);

io.on('connection', function(socket) {
    socket.on('canvas message', function( data ) {
        io.emit('canvas message', data);
    });
});

http.listen(9000, function(){
  console.log('listening on *:9000');
});
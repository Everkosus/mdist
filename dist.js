/**
 * Created by Everkosus on 21.11.2016.
 */
var express = require('express')
    ,   app = express()
    ,   server = require('http').createServer(app)
    ,   io = require('socket.io').listen(server)
    ,   conf = require('./config.json');

server.listen(conf.port);


app.use(express.static(__dirname + '/public'));

// wenn der Pfad / aufgerufen wird
app.get('/', function (req, res) {
    // so wird die Datei index.html ausgegeben
    res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.on('m', function(data){
      console.log(data);
  })
});

console.log('Der Server läuft nun unter http://127.0.0.1:' + conf.port + '/');
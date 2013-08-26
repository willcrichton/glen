// node-static serves files just any ol' server
var nodestatic = require('node-static');
var fs = new nodestatic.Server('./www');

// Create a Node HTTP server and serve up files via node-static
var server = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
        fs.serve(request, response);
    }).resume();
});

// By default, listen on port 80
server.listen(8080);

// Open a WebSocket on our server
var io = require('socket.io').listen(server, {log: false});

// Define useful objects for the players
var Vector = function(x, y, z) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.z = parseFloat(z);
}

var Player = function(args) {
    this.name = args.name;
    this.id = args.id;
    this.position = args.position;
    this.rotation = args.rotation;
}

// todo: implement Sanitize, don't send all info to user
Player.prototype = {
    Sanitize: function() {
        return this;
    }
}

// keep track of all players
var players = {};

// listen to players connecting to server
io.sockets.on('connection', function (socket) {
    var id = socket.id;
    console.log(id + " connected");

    // send player info of other players and his ID
    socket.emit('init', {
        id: id,
        players: players
    });

    // set up player info
    players[id] = new Player({
        name: "Minge Baggerson",
        id: id,
        position: new Vector(0, 0, 0),
        rotation: new Vector(0, 0, 0)
    });

    // tell everyone else who joined
    socket.broadcast.emit('joined', players[id]);

    // broadcast movement to other players
    // todo: make this not vulnerable to h4x
    socket.on('move', function(move) {
        if (typeof move != "object" || 
           typeof move.pos != "object" ||
           typeof move.rot != "object"
        ) {
            return;
        }

        var pos = new Vector(move.pos.x, move.pos.y, move.pos.z),
            rot = new Vector(move.rot.x, move.rot.y, move.rot.z);

        players[id].position = pos;
        players[id].rotation = rot;

        socket.broadcast.emit('move', {
            id: id, pos: pos, rot: rot
        });
    });
    
    // tell everyone if a player leaves
    socket.on('disconnect', function() {
        socket.broadcast.emit('left', id)
        delete players[id];
    });

    // broadcast chat to other players
    socket.on('chat', function(text) {
        socket.broadcast.emit('chat', text.substr(0, 200));
    });
});





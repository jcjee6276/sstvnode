

// const express = require('express');
// const http = require('http');
// const SocketIO = require('socket.io');

// const app = express();
// const webServer = http.createServer(app);
// const socketServer = SocketIO(webServer, {
//   cors: {
//     origin: "*",
//     credentials: true,
//   },
// });

// socketServer.on("connection", (socket) => {
//     socket.emit('msg', `${socket.id} 님이 입장했습니다.`);
    
//   socket.on("message", (message) => {

//     socketServer.emit("message", message);
//   });
// });

// webServer.listen(5001, () => {
//   console.log("Listening on port 5001");
// });


const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
var url = require('url');

app.use(cors());

console.log("55");
const port = 5001;
const server = app.listen(port, function() {
    console.log('Listening on '+port);
});

// const server = http.createServer(function(request, response){
    
//     response.writeHead(200, { 'Content-Type': 'text/html'});
//     response.end(clientHtml);
// });




const SocketIO = require('socket.io');
const io = SocketIO(server, {path: `/socket.io`});
const cookie = require("cookie");
    // const io = require("socket.io")(server, {
    //     cors: {
    //         origin: "http://localhost:8080",
    //         methods: ["GET", "POST"],
            
    //     }
    
    // });

    // server.listen(port);
let userId = "";
    app.get('/', cors(), function(req, res ) {
        console.log(req.query.userId);
        userId = req.query.userId;
        res.sendFile(__dirname + '/chat.html');
    });

io.on('connection',  function (socket) {
    //console.log(socket.handshake.query.userId);
    
    let user = {};
    let socketId = socket.id;
    user.socketId = userId;
    
    console.log(user.socketId);
    
    console.log(user.socketId, ' 님이 입장하셨습니다. ');

    io.emit('msg', `${user.socketId} has entered the chatroom.`);
    
    socket.on('msg', function (data) {
        console.log(user.socketId,': ', data);
        socket.broadcast.emit('msg', `${user.socketId}: ${data}`);
    });

    socket.on('disconnect', function (data) {
        io.emit('msg', `${user.socketId} has left the chatroom.`);

    });
});




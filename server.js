var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

server.listen(PORT, ()=>console.log("server started at ", PORT));
// WARNING: app.listen(80) will NOT work here!
let messageNumber =0;
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

const channels = {
    NMIT:'NMIT'
}

const sendMessage = (socket,message) =>{
    console.log("Broadcasting message: ", messageNumber++," ", message );
    socket.broadcast.emit(channels.NMIT, {message:message});
}

const listenForMessages = (socket,channel) =>{
    socket.on(channel, data =>{
        console.log("Received message: '", data.message, "' on channel: ", channel);
        console.log("Broadcasting message , ", data.message)
        socket.broadcast.emit(channels.NMIT, {message:data.message})
    })
}

io.on('connection', function (socket) {
    sendMessage(socket, "Welcome to NMIT", channels.NMIT);
    listenForMessages(socket, channels.NMIT);
    // listenForMessages(socket, channels.NMIT2);
    // listenForMessages(socket, channels.NMIT3);
});

setInterval(() => io.emit(channels.NMIT,{message: new Date().toTimeString()} ), 5000);

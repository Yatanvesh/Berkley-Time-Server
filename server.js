var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log("server started at ", PORT));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/serverShow.html');
});

app.get('/slow', function (req, res) {
    res.sendFile(__dirname + '/slowClient.html');
});

app.get('/fast', function (req, res) {
    res.sendFile(__dirname + '/fastClient.html');
});

let time = 0;
let numberOfClients = 2;
let totalTimeDifference=0;
let receivedTimeCount =0;
setInterval(() =>  time++, 1000);

const channels = {
    NMIT: 'NMIT',
    SHOWTIME:'SHOWTIME'
}

// const sendMessage = (socket,message) =>{
//     console.log("Broadcasting message: ", messageNumber++," ", message );
//     socket.broadcast.emit(channels.NMIT, {message:message});
// }

const listenForMessages = (socket, channel) => {
    socket.on(channel, data => {
        console.log("Received time: '", data.message);
        totalTimeDifference+= time - data.message;
        receivedTimeCount++;
        if(receivedTimeCount==numberOfClients){
            let avgTimeDifference = totalTimeDifference/numberOfClients;
            console.log("Avg time difference:", avgTimeDifference);
            let syncTime  = time + avgTimeDifference;
            console.log("Setting master time as ", syncTime);
            time = syncTime;
            broadcastMasterTime(socket);
        }
        // broadcastMasterTime(socket);
        // console.log("Broadcasting message , ", data.message)
        // socket.broadcast.emit(channels.NMIT, {message:data.message})
    })
}


// const listenForTimeRequest = (socket) => {
//     socket.on('SHOWTIME', data => {
//         console.log("sending current time");
//         if(data.count) numberOfClients=count;
//         broadcastMasterTime(socket, channels.SHOWTIME);
//     })
// }


const broadcastMasterTime = (socket, channel=channels.NMIT) => {
    socket.emit(channel, {
        message: time,
        type: 'SetTime'
    });
    socket.broadcast.emit(channel, {
        message: time,
        type: 'SetTime'
    });

}

io.on('connection', function (socket) {
    time =0;
    socket.emit(channels.NMIT, {type: 'ResetTime'});
    socket.broadcast.emit(channels.NMIT, {type: 'ResetTime'});
    listenForMessages(socket, channels.NMIT);
    // listenForTimeRequest(socket);

    setInterval(()=>{
        broadcastMasterTime(socket, channels.SHOWTIME);
    }, 1000);
});


setInterval(() => {

        io.emit(channels.NMIT, {
            type: 'RequestTime'
        });
        totalTimeDifference=0;
        receivedTimeCount=0;


    },
    5000);

   
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const { generateMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 5500;
const publicDir = path.join(__dirname, '/../public');
const Filter = require('bad-words');

// app.use(express.json())
app.use(express.static(publicDir));

app.get('', (req, res) => {
    res.render('index');
});

io.on('connection', (socket) => {
    console.log('new websocket connection...');

    socket.on('join', ({ username, room }) => {
        socket.join(room);

        socket.emit('message', generateMessage('Welcome'));
        socket.broadcast
            .to(room)
            .emit('message', generateMessage(`${username} has joined`));
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if (!filter.isProfane(message)) {
            io.to('r1').emit('message', generateMessage(message));
            callback(true);
        }

        callback(false);
    });

    socket.on('sendLocation', (location, callback) => {
        const url = 'https://google.com/maps?q=';
        socket.broadcast.emit(
            'locationMessage',
            generateMessage(`${url}${location.lat},${location.long}`)
        );
        callback(true);
    });

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left.'));
    });
});

server.listen(port, async () => {
    console.log(`server listening on ${port}`);
});

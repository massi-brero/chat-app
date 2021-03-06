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
const {
    addUser,
    removeUser,
    getUsersInRoom,
    getUser,
} = require('./utils/users');

// app.use(express.json())
app.use(express.static(publicDir));

app.get('', (req, res) => {
    res.render('index');
});

io.on('connection', (socket) => {
    console.log('new websocket connection...');

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'Welcome'));

        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                generateMessage('Admin', `${user.username} has joined`)
            );

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();
        if (!filter.isProfane(message) && user?.room) {
            io.to(user.room).emit(
                'message',
                generateMessage(user.username, message)
            );
            return callback(true);
        }

        callback(false);
    });

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);

        if (user?.room) {
            const url = 'https://google.com/maps?q=';
            socket.broadcast
                .to(user.room)
                .emit(
                    'locationMessage',
                    generateMessage(
                        user.username,
                        `${url}${location.lat},${location.long}`
                    )
                );
            return callback(true);
        }
        callback(false);
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                generateMessage(`${user.username} has left`)
            );

            io.to(user.room).emit('roomdata', {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });
});

server.listen(port, async () => {
    console.log(`server listening on ${port}`);
});

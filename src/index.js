const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const hbs = require('hbs')
const port = process.env.PORT || 5500
const publicDir = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')

//app.use(express.json())
app.set('views', viewsPath)
app.set('view engine', 'hbs')
app.use(express.static(publicDir))

app.get('', (req, res) => {
  res.render('index')
})

io.on('connection', (socket) => {
  console.log('new websocket connection...')
  socket.broadcast.emit('message', 'A new user has joined')

  socket.on('sendMessage', (message, callback) => {
    io.emit('message', message)
    callback(true)
  })

  socket.on('sendLocation', (location) => {
    const url = 'https://google.com/maps?q='
    socket.broadcast.emit('message', `${url}${location.lat},${location.long}`)
  })

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left.')
  })
})

server.listen(port, async () => {
  console.log(`server listening on ${port}`)
})

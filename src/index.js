const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const {generateMessage} = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// const hbs = require('hbs')
const port = process.env.PORT || 5500
const publicDir = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const Filter = require('bad-words')

//app.use(express.json())
app.set('views', viewsPath)
//app.set('view engine', 'html')
app.use(express.static(publicDir))

app.get('', (req, res) => {
  res.render('index')
})

io.on('connection', (socket) => { 
  console.log('new websocket connection...')

  socket.emit('message', generateMessage('Welcome'))

  socket.broadcast.emit('message', generateMessage('A new user has joined'))

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()
    if (!filter.isProfane(message)) {
      io.emit('message', generateMessage(message))
      callback(true)
    }

    callback(false)
  })

  socket.on('sendLocation', (location, callback) => {
    const url = 'https://google.com/maps?q='
    socket.broadcast.emit('locationMessage', generateMessage(`${url}${location.lat},${location.long}`))
    callback(true)
  })

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left.'))
  })
})

server.listen(port, async () => {
  console.log(`server listening on ${port}`)
})

const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const hbs = require('hbs')
const port = process.env.PORT || 3000
const publicDir = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')

//app.use(express.json())
app.set('views', viewsPath)
app.set('view engine', 'hbs')
app.use(express.static(publicDir))

app.get('', (req, res) => {
  res.render('index')
})

let count = 0

io.on('connection', (socket) => {
  console.log('new websocket connection...')

  socket.emit('countUpdated', count)

  socket.on('increment', () => {
    count++
    //socket.emit('countUpdated', count)
    io.emit('countUpdated', count)
  })
})

server.listen(port, async () => {
  console.log(`server listening on ${port}`)
})

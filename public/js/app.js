const socket = io()

const form = document.querySelector('form')
const input = document.querySelector('#messageInput')
const messageOutput = document.querySelector('#messageOutput')
const locationBtn = document.querySelector('#send-location')

form.addEventListener('submit', (e) => {
  e.preventDefault()
  socket.emit('sendMessage', input.value, (res) => {
    console.log('message delivered')
  })
})

locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    })
  })
})

socket.on('message', (message) => {
  messageOutput.textContent = message
})

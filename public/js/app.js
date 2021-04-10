const socket = io()

// Elements
const $form = document.querySelector('form')
const $input = $form.querySelector('#messageInput')
const $messageOutput = document.querySelector('#messageOutput')
const $locationBtn = document.querySelector('#send-location')
const $submitBtn = document.querySelector('#submit-btn')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML

$form.addEventListener('submit', (e) => {
  e.preventDefault()
  $submitBtn.setAttribute('disabled', 'disabled')
  $input.focus()

  socket.emit('sendMessage', $input.value, (res) => {
    $submitBtn.removeAttribute('disabled')

    if (!res) {
      $messageOutput.textContent = 'there was a problem delivering your post'
    }
  })
  $input.value = ''
})

$locationBtn.addEventListener('click', () => {
  $locationBtn.setAttribute('disabled', 'disabled')
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      (res) => {
        $locationBtn.removeAttribute('disabled')
        $messageOutput.textContent = res
          ? 'Location shared'
          : 'there was a problem sharing your location'
      }
    )
  })
})

socket.on('message', (message) => {
  //$messageOutput.textContent = message
  const html = Mustache.render(messageTemplate, {
    message,
  })
  $messageOutput.insertAdjacentHTML('beforeend', html)
})

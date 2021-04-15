const socket = io();

// Elements
const $form = document.querySelector('form');
const $input = $form.querySelector('#messageInput');
const $messageOutput = document.querySelector('#messages');
const $locationBtn = document.querySelector('#send-location');
const $submitBtn = document.querySelector('#submit-btn');

// Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
    '#location-message-template'
).innerHTML;

$form.addEventListener('submit', (e) => {
    e.preventDefault();
    $submitBtn.setAttribute('disabled', 'disabled');
    $input.focus();

    socket.emit('sendMessage', $input.value, (res) => {
        $submitBtn.removeAttribute('disabled');

        if (!res) {
            $messageOutput.textContent =
                'there was a problem delivering your post';
        }
    });
    $input.value = '';
});

$locationBtn.addEventListener('click', () => {
    $locationBtn.setAttribute('disabled', 'disabled');
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit(
            'sendLocation',
            {
                lat: position.coords.latitude,
                long: position.coords.longitude,
            },
            (res) => {
                $locationBtn.removeAttribute('disabled');
                const text = res
                    ? '## Location shared ##'
                    : '## there was a problem sharing your location ##';
                addToMessages(messageTemplate, { text });
            }
        );
    });
});

socket.on('message', (res) => {
    addToMessages(messageTemplate, res);
});

socket.on('locationMessage', (res) => {
    addToMessages(locationMessageTemplate, res);
});

addToMessages = (template, content) => {
    content.createdAt = content.createdAt
        ? dayjs(content.createdAt).format('HH:mm:ss')
        : '';

    $messageOutput.insertAdjacentHTML(
        'beforeend',
        Mustache.render(template, content)
    );
};

socket.emit('join', { username, room });

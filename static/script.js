const socket = io({
    auth: {
        cookie: document.cookie
    }
})

const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages')

socket.on('all_messages', function(msgArray){
    msgArray.forEach(msg => {
        let item = document.createElement('li')
        item.textContent = msg.login + ': ' + msg.content
        messages.appendChild(item)
    })
    messages.lastElementChild?.scrollIntoView({ behavior: 'smooth' });// плавна прокрутка
})


form.addEventListener('submit', function(e){
    e.preventDefault();
    if(input.value){
        socket.emit('new_message', input.value)
        input.value = '';
    }
})

socket.on('message', function(msg){
    let item = document.createElement('li')
    item.textContent = msg
    messages.appendChild(item)
    messages.lastElementChild?.scrollIntoView({ behavior: 'smooth' });// плавна прокрутка
})


exitButton.addEventListener('clock', e => {
    document.cookie = 'token =; Max-Age=0'
    location.assign('/login.html')
})
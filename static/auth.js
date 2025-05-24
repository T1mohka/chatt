const registerform = document.getElementById('register-form')
const loginform = document.getElementById('login-form')

registerform?.addEventListener('submit', (event) =>{
    event.preventDefault()
    const{login, password, confirmPassword} = registerform
    if(password.value !== confirmPassword.value){
        return alert('Password Do not match')
    }

    const user = JSON.stringify({
        login: login.value,
        password: password.value
    })

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/register')
    xhr.send(user)
    xhr.onload = () => alert(xhr.response) 
    registerform.reset()
})


loginform?.addEventListener('submit', (event) =>{
    event.preventDefault()
    const{login, password} = loginform

    const user = JSON.stringify({
        login: login.value,
        password: password.value
    })

    console.log(user)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/login')
    xhr.send(user)
    xhr.onload = () => {
        if(xhr.status === 200){
            const token = xhr.response
            document.cookie = `token=${token}`
            window.location.assign('/')
        }else{
            return alert(xhr.response)
        }
    }
    // registerform.reset()
})

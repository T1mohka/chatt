const http = require('http')
const path = require('path')
const fs = require('fs')
const db = require('./database')
const cookie = require('cookie')

const validAuthTokens = []

const pathToIndex = path.join(__dirname, 'static', 'index.html')
const indexHtmlFile = fs.readFileSync(pathToIndex)
const pathToStyle = path.join(__dirname, 'static', 'style.css')
const styleCssFile = fs.readFileSync(pathToStyle)
const pathToJs = path.join(__dirname, 'static', 'script.js')
const scriptJsFile = fs.readFileSync(pathToJs)

const pathToRegister = path.join(__dirname, 'static', 'register.html')
const RegisterHtmlFile = fs.readFileSync(pathToRegister)

const pathToAuthScript = path.join(__dirname, 'static', 'auth.js')
const authScriptFile = fs.readFileSync(pathToAuthScript)

const pathToLogin = path.join(__dirname, 'static', 'login.html')
const loginHtmlFile = fs.readFileSync(pathToLogin)

const server = http.createServer((req, res) => {
    // if(req.url === '/'){
    //     return res.end(indexHtmlFile)
    // }

    if(req.method === 'GET'){
    if(req.url === '/style.css'){
        return res.end(styleCssFile)
    }
    else if(req.url === '/script.js'){
        return res.end(scriptJsFile)
    }
    else if(req.url === '/register.html'){
        return res.end(RegisterHtmlFile)
    }
    else if(req.url === '/auth.js'){
        return res.end(authScriptFile)
    }
    else if(req.url === '/login.html'){
        return res.end(loginHtmlFile)
    }else guarded(req, res)
}

     if(req.method === 'POST'){
        if(req.url === '/api/register'){
            return registerUser(req, res)
        }
        if(req.url === '/api/login'){
            return login(req, res)
        }else guarded(req, res)
    }
    // res.statusCode  = 404
    // return res.end('Error 404')

})

function login(req, res){
    let data = ''
    req.on('data', function(chank){
        data += chank;

    })
    req.on('end', async function(){
        try {
            const user = JSON.parse(data)
            const token = await db.getAuthToken(user)
            validAuthTokens.push(token)
            res.writeHead(200)
            res.end(token)
        }catch(e){
            res.writeHead(500)
            return res.end('Error: ' + e)
        }
    })
}

function guarded(req, res){
    const credentionals = getCredentionals(req)
    if(!credentionals){
        res.writeHead(302, {'Location': '/login.html'})
        return res.end()
    }if(req.method == "GET"){
        if(req.url == '/') return res.end(indexHtmlFile)
        if(req.url == '/script.js') return res.end(scriptJsFile)
    }
    res.writeHead(404)
    return res.end('Error 404')
}

function getCredentionals(req){
    const cookies = cookie.parse(req.headers?.cookie || '')
    const token = cookies?.token
    if(!token || !validAuthTokens.includes(token)) return null
    const [user_id, login] = token.split('.')
    if(!user_id || !login) return null
    return {user_id, login}
}

function registerUser(req, res){
    let data = ''
    req.on('data', function(chank){
        data += chank

    })
    req.on('end', async function(){
        try {
            const user = JSON.parse(data)
            if(!user.login || !user.password){
                return res.end("You Forgot To Enter Login or Passwords")
            }  
            
            if(await db.isUserExist(user.login)){
                return res.end('Such User Already Exists')
            }
            await db.addUser(user)
            return res.end('User has been added')
        } 

        catch (error) {
            
        }
    })
}

server.listen(3000)


const { Server } = require('socket.io');
const { register } = require('module')
const io = new Server(server);

io.use((socket, next) => {
    const cookie = socket.handshake.auth.cookie;
    const credentionals = parseTokenFromCookie(socket.handshake.auth.cookie);
    if(!credentionals) {
      next(new Error("no auth"));
    }
    socket.credentionals = credentionals;
    next();
  });

 
  function parseTokenFromCookie(cookieStr) {
        const cookies = require('cookie').parse(cookieStr || '');
        const token = cookies.token;
        if (!token || !validAuthTokens.includes(token)) return null;
        const [user_id, login] = token.split('.');
        if (!user_id || !login) return null;
        return { user_id, login };
    }

io.on('connection', async(socket) => {
    console.log(socket.id);
    let messages = await db.getMessages()
    let userName = socket.credentionals?.login
    let userId = socket.credentionals?.user_id
    socket.emit('all_messages', messages)
    socket.on('new_message', (message) =>{
        db.addMessage(message, userId)
        io.emit('message', userName + ':' + message)
    })
})
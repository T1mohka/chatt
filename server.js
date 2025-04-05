const http = require('http')
const path = require('path')
const fs = require('fs')

const pathToIndex = path.join(__dirname, 'static', 'index.html')
const indexHtmlFile = fs.readFileSync(pathToIndex)
const pathToStyle = path.join(__dirname, 'static', 'style.css')
const styleCssFile = fs.readFileSync(pathToStyle)
const pathToJs = path.join(__dirname, 'static', 'script.js')
const scriptJsFile = fs.readFileSync(pathToJs)


const server = http.createServer((req, res) => {
    if(req.url === '/'){
        return res.end(indexHtmlFile)
    }
    if(req.url === '/style.css'){
        return res.end(styleCssFile)
    }
    if(req.url === '/script.js'){
        return res.end(scriptJsFile)
    }
    res.statusCode  = 404
    return res.end('Error 404')

})

server.listen(3000)
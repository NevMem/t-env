let express = require('express')
let http = require('http')
let worker = require('./worker')
require('colors')

let app = express()
let server = http.Server(app)
let io = require('socket.io')(server)

let connections = []

server.listen(80)

app.use((req, res, next) => {
    console.log(`[${req.method}]: ${req.url}`.magenta)
    next()
})

app.set('view engine', 'pug')

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('main')
})

io.on('connection', socket => {
    connections.push(socket)
    console.log('new socket.io connection'.yellow)
    console.log(worker.getTests())
    for (let i = 0; i != worker.getTests().length; ++i) {
        socket.emit('new test', {
            testName: worker.getTests()[i].name, 
            id: worker.getTests()[i].id
        })
    }

    socket.on('get test info', (request) => {
        if (!request.id)
            return
        let test = tests.getTestById(request.id)
        if (!test)
            return
        socket.emit('test info', {
            id: request.id,
            input: test.input, 
            output: test.output
        })
    })

    socket.on('disconnect', () => {
        console.log('disconnected one')
        let index = connections.indexOf(socket)
        if (index == -1)
            return
        connections.splice(index, 1)
    })
})
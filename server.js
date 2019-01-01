let express = require('express')
let http = require('http')
let worker = require('./worker')
require('colors')

let app = express()
let server = http.Server(app)
let io = require('socket.io')(server)

const EventEmitter = require('events')
let onlineChanges = new EventEmitter()

worker.onlineEmitter(onlineChanges)

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
    for (let i = 0; i != worker.getTests().length; ++i) {
        socket.emit('new test', {
            testName: worker.getTests()[i].name, 
            id: worker.getTests()[i].id
        })
    }

    for (let i = 0; i != worker.getQueue().length; ++i) {
        socket.emit('new record',
            worker.getQueue()[i]
        )
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

    socket.on('get test name by id', data => {
        let test = worker.getTestById(data.testId)
        if (!test)
            return
        socket.emit('test name by id', { testId: data.testId, name: test.name })
    })

    socket.on('get test input', data => {
        let testId = data.testId
        socket.emit('test input', {
            testId: testId,
            input: worker.getTestById(testId).input
        })
    })

    socket.on('get test answer', data => {
        let testId = data.testId
        socket.emit('test answer', {
            testId: testId,
            answer: worker.getTestById(testId).output
        })
    })

    socket.on('add test', data => {
        let {input, output, name} = data
        let info = worker.addTest(input, output, name)
        onlineChanges.emit('test added', info)
    })

    socket.on('evaluate', settings => {
        let compilationArgs = prepareCompilationArgs(settings)
        let runType = 'single'
        if (settings.runType === 'parallel')
            runType = 'parallel'
        worker.addToQueue('D:\\memlo\\workspace\\prepare\\src\\contest.cpp', compilationArgs, settings.timelimit, runType)
        onlineChanges.emit('new record', worker.getQueue().length - 1)
    })

    socket.on('delete test', (msg) => {
        console.log('Request for removing test', msg)
        let info = worker.deleteTest({ id: msg.testId })
        socket.emit('info', info)
    })

    socket.on('disconnect', () => {
        console.log('disconnected one')
        let index = connections.indexOf(socket)
        if (index == -1)
            return
        connections.splice(index, 1)
    })
})

let prepareCompilationArgs = (settings) => {
    let args = []
    if (settings.using_O2 === true)
        args.push('-O2')
    if (settings.using_glibcxx_debug === true)
        args.push('-D_GLIBCXX_DEBUG')
    if (settings.using_glibcxx_debug_pedantic === true)
        args.push('-D_GLIBCXX_DEBUG_PEDANTIC')
    return args
}

let sendAll = (type, message) => {
    for (let client of connections) {
        client.emit(type, message)
    }
}

onlineChanges.on('change feedback', (message) => {
    for (let client of connections) {
        client.emit('change feedback', message)
    }
})

onlineChanges.on('change status', (message) => {
    for (let client of connections) {
        client.emit('change status', message)
    }
})

onlineChanges.on('new record', (index) => {
    sendAll('new record', worker.getQueue()[index])
})

onlineChanges.on('test added', (message) => {
    sendAll('new test', {
        testName: message.testName,
        id: message.id
    })
})
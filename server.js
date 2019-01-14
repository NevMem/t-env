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
    res.send('This kind of connectios is not supported yet')
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
        let records = worker.getCuttedQueue()
        socket.emit('new record',
            records[i]
        )
    }

    socket.on('get test info', (request) => {
        console.log('get TEST INFO request'.magenta)
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
        console.log('get TEST NAME BY ID request'.magenta)
        let test = worker.getTestById(data.testId)
        if (!test)
            return
        socket.emit('test name by id', { testId: data.testId, name: test.name })
    })

    socket.on('get test input', data => {
        console.log('get TEST INPUT request'.magenta)
        let testId = data.testId
        socket.emit('test input', {
            testId: testId,
            input: worker.getTestById(testId).input
        })
    })

    socket.on('get test answer', data => {
        console.log('get TEST ANSWER request'.magenta)
        let testId = data.testId
        socket.emit('test answer', {
            testId: testId,
            answer: worker.getTestById(testId).output
        })
    })

    socket.on('add test', data => {
        console.log('add TEST request'.cyan)
        let {input, output, name} = data
        let info = worker.addTest(input, output, name)
        onlineChanges.emit('test added', info)
    })

    socket.on('evaluate', settings => {
        console.log('EVALUATE request'.cyan)
        let compilationArgs = prepareCompilationArgs(settings)
        let runType = 'single'
        if (settings.runType === 'parallel')
            runType = 'parallel'
        if (settings.path !== undefined) {
            worker.addToQueue(settings.path, compilationArgs, settings.timelimit, runType)
            onlineChanges.emit('new record', worker.getQueue().length - 1)
            onlineChanges.emit('info', { type: 'success', msg: 'Program will be tested', heading: 'Server' })
        } else {
            onlineChanges.emit('info', { type: 'error', msg: 'You didn\t specify the path to your program', heading: 'Server' })
        }
    })

    socket.on('delete test', (msg) => {
        console.log('DELETE TEST request'.red)
        let info = worker.deleteTest({ id: msg.testId })
        socket.emit('info', info.userMessage)
        if (info.result === 'ok') {
            socket.emit('delete test', { testId: msg.testId })
        }
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

onlineChanges.on('info', msg => {
    sendAll('info', msg)
})

onlineChanges.on('change compilation out', msg => {
    sendAll('change compilation out', msg)
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
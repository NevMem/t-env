let cp = require('child_process')
const EventEmitter = require('events')
let invokationLoop = new EventEmitter()
let fs = require('fs')
require('colors')

let onlineChanges = undefined
let emitOnline = (type, message) => {
    if (onlineChanges)
        onlineChanges.emit(type, message)
}

exports.onlineEmitter = (eventer) => {
    onlineChanges = eventer
}

let config = {
    id_length: 10
}

let tests = []
let invokationQueue = []
let currentIndex = 0
let runningNow = false

let saveTests = () => {
    fs.writeFileSync('tests.json', JSON.stringify(tests))
    console.log('Saved test.json'.cyan)
    console.log((tests.length + '').green)
}

let loadTests = () => {
    let data = fs.readFileSync('tests.json', 'utf-8')
    tests = JSON.parse(data)
    console.log('Loaded test from file'.green + (' count of tests : ' + tests.length).cyan)
}

invokationLoop.on('new item', () => {
    invokationLoop.emit('try run')
})

invokationLoop.on('try run', () => {
    if (currentIndex < invokationQueue.length && !runningNow) {
        runningNow = true
        invokationLoop.emit('run')
    }
})

invokationLoop.on('run', () => {
    let now = invokationQueue[currentIndex]
    let invoker = cp.fork('invoker')
    invoker.send({
        type: 'initial',
        policy: now.policy,
        compilationArgs: now.compilationArgs,
        filename: now.filename,
        tests: tests
    })
    invoker.on('message', message => {
        if (message.type === 'feedback') {
            invokationQueue[currentIndex].feedback[message.test_id].time = message.feedback.time
            invokationQueue[currentIndex].feedback[message.test_id].stdout = message.feedback.stdout
            invokationQueue[currentIndex].feedback[message.test_id].stderr = message.feedback.stderr
            invokationQueue[currentIndex].feedback[message.test_id].exitCode = message.feedback.exitCode
            invokationQueue[currentIndex].feedback[message.test_id].status = message.feedback.status
        } else if (message.type === 'change status') {
            invokationQueue[currentIndex].status = message.status
            emitOnline('change status', {
                queueIndex: currentIndex, 
                status: invokationQueue[currentIndex].status
            })
        } else {
            console.log(('Unknown message type: ' + message.type).red)
        }
        emitOnline('change feedback', {
            queueIndex: currentIndex, 
            feedback: invokationQueue[currentIndex].feedback
        })
    })
    invoker.on('exit', (code, signal) => {
        console.log(`Invoker exited with code: ${code} signal: ${signal}`.magenta)
        runningNow = false
        currentIndex += 1
        invokationLoop.emit('try run')
    })
})

let evaluationInfo = (filename, input, output) => {
    return {
        filename: filename,
        input: input,
        output: output
    }
}

let createId = () => {
    let id = ''
    for (let i = 0; i != config.id_length; ++i) {
        let now = Math.random() * 62 | 0
        if (now < 10) {
            id += String.fromCharCode('0'.charCodeAt(0) + now)
        } else if (now < 36) {
            id += String.fromCharCode('a'.charCodeAt(0) + now - 10)
        } else {
            id += String.fromCharCode('A'.charCodeAt(0) + now - 36)
        }
    }
    return id
}

let createTest = (input, output, testName) => {
    if (!testName) {
        testName = 'u_test ' + tests.length
    }
    return {
        name: testName,
        input: input, 
        output: output,
        id: createId()
    }
}

exports.getTests = () => {
    return tests
}

exports.addTest = (input, output, testName) => {
    tests.push(createTest(input, output, testName))
    saveTests()
    return {
        testName: tests[tests.length - 1].name,
        id: tests[tests.length - 1].id
    }
}

exports.addToQueue = (filename, compilationArgs, timeLimit, runType) => {
    if (runType === 'parallel' || runType === 'single') {
        let newRecord = {
            compilationArgs: compilationArgs,
            filename: filename,
            policy: runType,
            timelimit: timeLimit,
            feedback: [],
            status: 'waiting'
        }
        for (let i = 0; i != tests.length; ++i) {
            newRecord.feedback.push({ testId: tests[i].id, status: 'waiting', stdout: '', stderr: '', exitCode: undefined, time: undefined })
        }
        invokationQueue.push(newRecord)
        console.log(invokationQueue)
        console.log('New record was successfully added to invokation queue'.green)
        invokationLoop.emit('new item')
    } else {
        console.log('Unknow run type'.red)
    }
}

exports.getTestIndexById = (id) => {
    for (let index = 0; index < tests.length; ++index) {
        if (tests[index].id === id)
            return index
    }
    return undefined
}

exports.getTestById = (id) => {
    let index = this.getTestIndexById(id)
    if (index === undefined)
        return undefined
    return tests[index]
}

exports.getQueue = () => {
    return invokationQueue
}

exports.deleteTest = (info) => {
    let index = this.getTestIndexById(info.id)
    console.log(index)
    if (index === undefined)
        return { type: 'error', msg: 'test not found', heading: 'test removing' }
    tests.splice(index, 1)
    saveTests()
    return { type: 'success', msg: 'test was deleted', heading: 'test removing' }
}

console.log('Current process pid', process.pid)

loadTests()
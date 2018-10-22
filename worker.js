let cp = require('child_process')
const EventEmitter = require('events')
let invokationLoop = new EventEmitter()
require('colors')

let config = {
    id_length: 10
}

let tests = []
let invokationQueue = []
let currentIndex = 0
let runningNow = false

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
            invokationQueue[currentIndex].feedback[message.test_id] = message.feedback
        } else if (message.type === 'change status') {
            invokationQueue[currentIndex].status = message.status
        } else {
            console.log(('Unknown message type: ' + message.type).red)
        }
    })
    invoker.on('exit', (code, signal) => {
        console.log(`Invoker exited with code: ${code} signal: ${signal}`.magenta)
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
        testName = 'u test'
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
}

exports.addToQueue = (filename, compilationArgs, runType) => {
    if (runType === 'parallel' || runType === 'single') {
        let newRecord = {
            compilationArgs: compilationArgs,
            filename: filename,
            policy: runType, 
            feedback: [],
            status: 'waiting'
        }
        for (let i = 0; i != tests.length; ++i) {
            newRecord.feedback.push({ info: 'waiting', stdout: '', stderr: '', exitCode: undefined, time: undefined })
        }
        invokationQueue.push(newRecord)
        console.log('New record was successfully added to invokation queue'.green)
        invokationLoop.emit('new item')
    } else {
        console.log('Unknow run type'.red)
    }
}

exports.getTestById = (id) => {
    for (let i = 0; i !== tests.length; ++i) {
        if (tests[i].id === id)
            return tests[i]
    }
    return undefined
}

exports.getQueue = () => {
    return invokationQueue
}

exports.addTest('1 2', '3')
exports.addTest('3 4', '7')
exports.addTest('100000000000 100000000000', '200000000000')
exports.addTest('10 2', '12')
exports.addTest('10 22', '32')
// exports.addToQueue('D:\\memlo\\workspace\\prepare\\src\\contest.cpp', '', 'parallel')

console.log('Current process pid', process.pid)
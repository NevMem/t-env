let cp = require('child_process')
const EventEmmiter = require('events')
require('colors')

let tests = undefined
let filename = undefined
let policy = undefined
let compilationArgs = undefined

let runLoop = new EventEmmiter()

let feedback = []

let compile = () => {
    process.send({
        type: 'change status',
        status: 'compiling'
    })
    return new Promise((resolve, reject) => {
        let executableName = __dirname + '\\bin\\program' + process.pid + '.exe'
        compilationArgs.push(filename, '-o', executableName)
        let child = cp.spawnSync('g++', compilationArgs)
        if (child.status == 0) {
            resolve({
                executableName: executableName
            })   
        } else {
            reject(child.stderr.toString())
        }
    })
}

function evaluate(executable, input, output) {
    return new Promise((resolve, reject) => {
        let startTime = process.hrtime()
        let child = cp.spawn(executable)
        let out = '', outerr = ''
        child.stdin.write(input)
        child.stdin.end()
        child.stdout.on('data', chunk => {
            out += chunk
        })
        child.stderr.on('data', chunk => {
            outerr += chunk
        })
        child.on('exit', (code, signal) => {
            let delta = process.hrtime(startTime)
            delta = delta[0] * 1e9 + delta[1]
            delta = delta / 1e6
            if (code === 0) {
                resolve({
                    stdout: out,
                    stderr: outerr,
                    exitCode: code,
                    time: delta
                })
            } else {
                reject({
                    stdout: out,
                    stderr: outerr,
                    exitCode: code,
                    time: delta
                })
            }
        })
    })
}

let cut = (str) => {
    let ret = []
    now = ''
    for (let i = 0; i < str.length; ++i) {
        if (str[i] !== '\n' && str[i] !== '\r' && str[i] !== ' ') { 
            now += str[i]
        } else {
            if (now.length !== 0)
                ret.push(now)
            now = ''
        }
    }
    if (now.length !== 0)
        ret.push(now)
    return ret
}

async function run(executable) {
    for (let i = 0; i != tests.length; ++i) {
        feedback.push({
            status: 'waiting',
            exitCode: undefined,
            stdout: undefined,
            stderr: undefined,
            time: undefined
        })
    }
    if (policy === 'parallel') {
        policy = 'single'
        process.send({
            type: 'message',
            message: 'Parallel running not ready, fallback to single'
        })
    }

    if (policy === 'single') {
        for (let i = 0; i != tests.length; ++i) {
            process.send({
                type: 'change status',
                status: 'Running ' + (i + 1) + ' test'
            })
            feedback[i].status = 'running'
            process.send({
                type: 'feedback',
                test_id: i,
                feedback: feedback[i]
            })
            let evaluationStatus = undefined
            try {
                evaluationStatus = await evaluate(executable, tests[i].input, tests[i].output)
            } catch (ex) {
                evaluationStatus = ex
            }
            feedback[i].exitCode = evaluationStatus.exitCode
            feedback[i].stdout = evaluationStatus.stdout
            feedback[i].stderr = evaluationStatus.stderr
            feedback[i].time = evaluationStatus.time
            if (evaluationStatus.exitCode === 0) {
                let expected = cut(tests[i].output)
                let found = cut(feedback[i].stdout)
                if (found.length != expected.length) {
                    feedback[i].status = 'presentation error'
                } else {
                    let allOk = true
                    for (let j = 0; j != found.length; ++j) {
                        if (found[j] != expected[j]) {
                            feedback[i].status = 'wrong answer'
                            allOk = false
                            break
                        }
                    }
                    if (allOk) {
                        feedback[i].status = 'ok'
                    }
                }
            } else {
                feedback[i].status = 'runtime error'
            }
            process.send({
                type: 'feedback',
                test_id: i,
                feedback: feedback[i]
            })
            process.send({
                type: 'change status',
                status: 'Ready'
            })
        }
    }
    process.send({
        type: 'full feedback',
        feedback: feedback
    })
    process.exit(0)
}

let startInvokation = () => {
    compile().then(info => {
        process.send({
            type: 'change status',
            status: 'compiled'
        })
        run(info.executableName)
    }).catch(err => {
        console.log('Compilation error'.red)
        console.log(err)
    })
}

process.on('message', msg => {
    if (msg.type === 'initial') {
        if (!filename) {
            tests = msg.tests
            filename = msg.filename
            policy = msg.policy
            compilationArgs = msg.compilationArgs.split()
            if (compilationArgs.length == 1 && compilationArgs[0].length == 0)
                compilationArgs = []

            startInvokation()
        } else {
            console.log('Doubled initialization message'.red)
        }
    } else {
        console.log('Unknown message type'.red)
        console.log(msg)
    }
})
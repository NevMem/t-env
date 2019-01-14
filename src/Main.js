import React, { Component } from 'react'
import openSocket from 'socket.io-client'
import update from 'react-addons-update'
import Modal from './Modal'
import CreateTestForm from './components/CreateTestForm'
import EvaluationCard from './components/EvaluationCard'
import Notifications from './components/Notifications'
import CompilationOut from './components/CompilationOut'
import Header from './components/Header.js'
import TestsCard from './components/TestsCard'
import ModerateTestForm from './components/ModerateTestForm'
import Preloader from './components/Preloader'
import QueueCard from './components/QueueCard'

export default class App extends Component {
  constructor(prps) {
    super(prps)
    this.state = {
      socket: openSocket('http://localhost:80'),
      online: false,
      tests: [],
      queue: [],
      getTestNameById: new Set(),
      requested: new Set(),
      modalVisible: false,
      modalHeader: 'Modal header',

      queueIndex: undefined,
      testIndex: undefined,

      modalMode: 'none',

      newTestName: '',

      notifications: [],
    }
    this.state.socket.on('connect', () => {
      this.addNotification({
        type: 'success',
        msg: 'connected to server',
        heading: 'client',
      })
      this.setState({ online: true, tests: [], queue: [] })
    })
    this.state.socket.on('new test', test => {
      this.setState({ tests: [...this.state.tests, test] })
    })
    this.state.socket.on('new record', record => {
      record.expanded = false
      this.setState({ queue: [record, ...this.state.queue] })
    })
    this.state.socket.on('delete test', testInfo => {
      this.setState(state => {
        let new_state = Object.assign({}, state)
        for (let i = 0; i != new_state.tests.length; ++i) {
          if (new_state.tests[i].id === testInfo.testId) {
            new_state.tests.splice(i, 1)
            break
          }
        }
        return new_state
      })
    })
    this.state.socket.on('test input', data => {
      let { testId, input } = data
      for (let i = 0; i < this.state.tests.length; ++i) {
        if (this.state.tests[i].id === testId) {
          this.setState({
            tests: update(this.state.tests, {
              [i]: {
                $merge: {
                  input: input,
                },
              },
            }),
          })
        }
      }
    })
    this.state.socket.on('test answer', data => {
      let { testId, answer } = data
      for (let i = 0; i < this.state.tests.length; ++i) {
        if (this.state.tests[i].id === testId) {
          this.setState({
            tests: update(this.state.tests, {
              [i]: {
                $merge: {
                  answer: answer,
                },
              },
            }),
          })
        }
      }
    })
    this.state.socket.on('test output', data => {
      let { queueIndex, testIndex, stdout } = data
      this.setState(state => {
        let new_state = Object.assign({}, state)
        if (queueIndex !== undefined && 0 <= queueIndex && queueIndex < new_state.queue.length &&
          testIndex !== undefined && 0 <= testIndex && testIndex < new_state.queue[queueIndex].feedback.length)
          new_state.queue[new_state.queue.length - 1 - queueIndex].feedback[testIndex].stdout = stdout
        return new_state
      })
    })
    this.state.socket.on('test name by id', data => {
      this.setState(({ getTestNameById }) => {
        let newInfo = new Set()
        for (let elem in getTestNameById) newInfo[elem] = getTestNameById[elem]
        newInfo[data.testId] = data.name
        return { getTestNameById: newInfo }
      })
    })
    this.state.socket.on('change feedback', message => {
      this.setState({
        queue: update(this.state.queue, {
          [this.state.queue.length - 1 - message.queueIndex]: {
            $merge: {
              feedback: message.feedback,
            },
          },
        }),
      })
    })
    this.state.socket.on('info', msg => {
      this.addNotification(msg)
    })
    this.state.socket.on('change status', status => {
      this.setState({
        queue: update(this.state.queue, {
          [this.state.queue.length - 1 - status.queueIndex]: {
            $merge: {
              status: status.status,
            },
          },
        }),
      })
    })
    this.state.socket.on('change compilation out', msg => {
      let index = msg.queueIndex
      let out = msg.compilation_out
      if (index >= 0 && index < this.state.queue.length) {
        this.setState({
          queue: update(this.state.queue, {
            [this.state.queue.length - 1 - index]: {
              $merge: {
                compilation_out: out,
              },
            },
          }),
        })
      }
    })
    this.state.socket.on('disconnect', () => {
      this.addNotification({
        type: 'error',
        msg: 'disconnected from server',
        heading: 'client',
      })
      this.setState({ online: false, tests: [], queue: [], modalVisible: false, modalMode: 'none' })
    })
  }

  addNotification(notification) {
    this.setState({
      notifications: [...this.state.notifications, notification],
    })
  }

  inputChange(event) {
    this.setState({
      [event.target.id]: event.target.value,
    })
  }

  evaluate(settings) {
    if (!this.state.socket) {
      addNotification({
        type: 'error',
        msg: "You're disconnected",
        heading: 'Connection problems',
      })
    } else {
      this.state.socket.emit('evaluate', settings)
    }
  }

  deleteTest(event) {
    event.preventDefault()
    this.state.socket.emit('delete test', {
      testId: this.state.tests[this.state.testIndex].id
    })
    this.setState({
      modalMode: 'none',
      modalVisible: false,
    })
    this.addNotification({ heading: 'Deleting', msg: 'Request for test removing was send', type: 'default' })
  }

  renderModalContent() {
    if (this.state.modalMode === 'none') return null
    if (this.state.modalMode === 'show feedback') {
      let testName = 'Undefined'
      let timeConsumed = 'Undefined'
      let exitCode = 'Undefined'
      let status = 'Undefined'
      let input = 'Undefined'
      let output = 'Undefined'
      let answer = 'Undefined'
      if (
        this.state.queueIndex !== undefined &&
        this.state.testIndex !== undefined
      ) {
        testName = this.state.getTestNameById[
          this.state.queue[this.state.queueIndex].feedback[this.state.testIndex]
            .testId
        ]
        timeConsumed = this.state.queue[this.state.queueIndex].feedback[
          this.state.testIndex
        ].time
        status = this.state.queue[this.state.queueIndex].feedback[
          this.state.testIndex
        ].status
        exitCode = this.state.queue[this.state.queueIndex].feedback[
          this.state.testIndex
        ].exitCode
        output = this.state.queue[this.state.queueIndex].feedback[
          this.state.testIndex
        ].stdout
        input = this.state.tests[this.state.testIndex].input
        answer = this.state.tests[this.state.testIndex].answer
        if (input === undefined) {
          input = <Preloader isLoaded = {false} />
          this.state.socket.emit('get test input', {
            testId: this.state.tests[this.state.testIndex].id,
          })
        }
        if (answer === undefined) {
          answer = <Preloader isLoaded = {false} />
          this.state.socket.emit('get test answer', {
            testId: this.state.tests[this.state.testIndex].id,
          })
        }
        if (
          output === undefined ||
          (output !== undefined && output.length === 0)
        ) {
          if (output === undefined) {
            this.state.socket.emit('get test output', {
              queueIndex: this.state.queue.length - 1 - this.state.queueIndex,
              testIndex: this.state.testIndex,
            })
            output = <Preloader isLoaded = {false} />
          } else {
            output = 'none'
          }
        }
      }
      return (
        <div className='test-info-field'>
          <div className='full-test-info'>
            <h2>Test name: {testName}</h2>
            <h3>Verdict: {status}</h3>
            <h3>Exit code: {exitCode}</h3>
            <h3>Time consumed: {timeConsumed}</h3>
          </div>
          <div className='test-input'>
            <div>Input</div>
            <div className='text-area'>{input}</div>
          </div>
          <div className='test-answer'>
            <div>Answer</div>
            <div className='text-area'>{answer}</div>
          </div>
          <div className='test-output'>
            <div>Output</div>
            <div className='text-area'>{output}</div>
          </div>
        </div>
      )
    }
    if (this.state.modalMode === 'moderate test') {
      return (
        <ModerateTestForm
          test = {this.state.tests[this.state.testIndex]}
          socket = {this.state.socket}
          deleteTest = {this.deleteTest.bind(this)}
        />
      )
    }
    if (this.state.modalMode === 'test creation') {
      return <CreateTestForm closeModal = {this.closeModal.bind(this)} socket={this.state.socket} />
    }
    return null
  }

  renderModalHeader() {
    return (
      <div className='modal-header-row'>
        <h2>{this.state.modalHeader}</h2>
        <div className='modal-close' onClick={this.closeModal.bind(this)}></div>
      </div>
    )
  }

  closeModal() {
    this.setState({ modalVisible: false, modalMode: 'none' })
  }

  showModal() {
    this.setState({ modalVisible: true })
  }

  expandRecord(index, event) {
    event.preventDefault()
    this.setState({
      queue: update(this.state.queue, {
        [index]: { $merge: { expanded: !this.state.queue[index].expanded } },
      }),
    })
    for (let i = 0; i != this.state.queue[index].feedback.length; ++i) {
      let element = this.state.queue[index].feedback[i]
      if (
        !this.state.getTestNameById[element.testId] &&
        !this.state.requested[element.testId]
      ) {
        this.setState(
          ({ requested }) => {
            requested: new Set(requested.add(element.testId))
          },
          () => {
            this.state.socket.emit('get test name by id', {
              testId: element.testId,
            })
          },
        )
      }
    }
  }

  showTestFeedback(queueIndex, testIndex, event) {
    event.preventDefault()
    this.setState({
      queueIndex: queueIndex,
      testIndex: testIndex,
      modalMode: 'show feedback',
      modalHeader: 'Test feedback',
    })
    this.showModal()
  }

  moderateTest(index, event) {
    event.preventDefault()
    this.setState({
      modalMode: 'moderate test',
      testIndex: index,
      modalHeader: 'Test info',
    })
    this.showModal()
  }

  addTest(event) {
    event.preventDefault()
    this.setState({
      modalHeader: 'Create test',
      modalMode: 'test creation',
    })
    this.showModal()
  }

  removeNotification(index, event) {
    event.preventDefault()
    let newNotifications = [...this.state.notifications]
    newNotifications.splice(this.state.notifications.length - 1 - index, 1)
    this.setState({
      notifications: newNotifications,
    })
  }

  getTestNameById(id) { 
    if (this.state.getTestNameById[id])
      return this.state.getTestNameById[id]
    return 'Loading'
  }

  render() {
    return (
      <div className='wrapper'>
        <Modal
          modalHeader={this.state.modalHeader}
          renderContent={this.renderModalContent.bind(this)}
          renderHeader={this.renderModalHeader.bind(this)}
          visible={this.state.modalVisible}
        />
        <Notifications
          delete={this.removeNotification.bind(this)}
          maxCount={5}
          notifications={this.state.notifications}
        />
        <Header isOnline = {this.state.online} />
        <TestsCard
          tests = {this.state.tests}
          moderateTest = {this.moderateTest.bind(this)}
          addTest = {this.addTest.bind(this)}
        />
        <EvaluationCard
          notify={this.addNotification.bind(this)}
          evaluate={this.evaluate.bind(this)}
        />
        <QueueCard
          queue = {this.state.queue}
          expandRecord = {this.expandRecord.bind(this)}
          showTestFeedback = {this.showTestFeedback.bind(this)}
          getTestNameById = {this.getTestNameById.bind(this)}
        />
      </div>
    )
  }
}

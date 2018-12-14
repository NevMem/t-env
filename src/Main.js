import React, { Component } from 'react'
import openSocket from 'socket.io-client'
import update from 'react-addons-update'
import Modal from './Modal'
import CreateTestForm from './components/CreateTestForm'
import CustomCheckBox from './components/CustomCheckBox';
import EvaluationCard from './components/EvaluationCard';

export default class App extends Component {
  constructor(prps) {
    super(prps)
    console.log('Hello')
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

      newTestName: ''
    }
    this.state.socket.on('connect', () => {
      console.log('connected')
      this.setState({ online: true, tests: [], queue: [] })
    })
    this.state.socket.on('new test', test => {
      this.setState({ tests: [...this.state.tests, test] })
    })
    this.state.socket.on('new record', record => {
      console.log(record)
      record.expanded = false
      this.setState({ queue: [record, ...this.state.queue] })
    })
    this.state.socket.on('test input', data => {
      let {testId, input} = data
      for (let i = 0; i < this.state.tests.length; ++i) {
        if (this.state.tests[i].id === testId) {
          this.setState({
            tests: update(this.state.tests, {
              [i]: {
                $merge: {
                  input: input
                }
              }
            })
          })
        }
      }
    })
    this.state.socket.on('test answer', data => {
      let {testId, answer} = data
      for (let i = 0; i < this.state.tests.length; ++i) {
        if (this.state.tests[i].id === testId) {
          this.setState({
            tests: update(this.state.tests, {
              [i]: {
                $merge: {
                  answer: answer
                }
              }
            })
          })
        }
      }
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
    this.state.socket.on('change status', status => {
      console.log(status)
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
    this.state.socket.on('disconnect', () => {
      console.log('disconnected')
      this.setState({ online: false, tests: [], queue: [] })
    })
  }

  inputChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    })
  }

  evaluate() {
    if (!this.state.socket) {
    } else {
      this.state.socket.emit('evaluate')
    }
  }

  renderModalContent() {
    if (this.state.modalMode === 'none')
      return null
    if (this.state.modalMode === 'show feedback') {
      let testName = 'Undefined'
      let timeConsumed = 'Undefined'
      let exitCode = 'Undefined'
      let status = 'Undefined'
      let input = 'Undefined'
      let output = 'Undefined'
      let answer = 'Undefined'
      if (this.state.queueIndex !== undefined && this.state.testIndex !== undefined) {
        console.log(this.state.queue[this.state.queueIndex])
        testName = this.state.getTestNameById[this.state.queue[this.state.queueIndex].feedback[this.state.testIndex].testId]
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
          input = 'Undefined'
          this.state.socket.emit('get test input', {
            testId: this.state.tests[this.state.testIndex].id
          })
        }
        if (answer === undefined) {
          this.state.socket.emit('get test answer', {
            testId: this.state.tests[this.state.testIndex].id
          })
          answer = 'Undefined'
        }
        if (output === undefined || (output !== undefined && output.length === 0)) {
          output = 'UNDEFINED'
        }
      }
      return (
        <div className="test-info-field">
          <div className="full-test-info">
            <h2>Test name: {testName}</h2>
            <h3>Verdict: {status}</h3>
            <h3>Exit code: {exitCode}</h3>
            <h3>Time consumed: {timeConsumed}</h3>
          </div>
          <div className="test-input">
            <div>Input</div>
            <div className = 'text-area'>
              {input}
            </div>
          </div>
          <div className="test-answer">
            <div>Answer</div>
            <div className = 'text-area'>
              {answer}
            </div>
          </div>
          <div className="test-output">
            <div>Output</div>
            <div className = 'text-area'>
              {output}
            </div>
          </div>
        </div>
      )
    }
    if (this.state.modalMode === 'moderate test') {
      let input = 'Undefined'
      let answer = 'Undefined'
      input = this.state.tests[this.state.testIndex].input
      answer = this.state.tests[this.state.testIndex].answer
      if (input === undefined) {
        input = 'Undefind'
        this.state.socket.emit('get test input', { testId: this.state.tests[this.state.testIndex].id })
      }
      if (answer === undefined) {
        answer = 'Undefined'
        this.state.socket.emit('get test answer', { testId: this.state.tests[this.state.testIndex].id })
      }
      return (
        <div className = 'testModeration'>
          <div className = 'heading'>
            <h1>Test name: {this.state.tests[this.state.testIndex].testName}</h1>
            <h2>Test id: {this.state.tests[this.state.testIndex].id}</h2>
          </div>
          <div className = 'input-area'>
            <h3>Input:</h3>
            <div className = 'text-area'>
              {input}
            </div>
          </div>
          <div className = 'answer-area'>
            <h3>Answer:</h3>
            <div className = 'text-area'>
              {answer}
            </div>
          </div>
        </div>
      )
    }
    if (this.state.modalMode === 'test creation') {
      return (
        <CreateTestForm socket = {this.state.socket} />
      )
    }
    return null
  }

  renderModalHeader() {
    return (
      <div className="modal-header-row">
        <h2>{this.state.modalHeader}</h2>
        <div className="modal-close" onClick={this.closeModal.bind(this)}>
          close
        </div>
      </div>
    )
  }

  closeModal() {
    this.setState({ modalVisible: false })
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
          }
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
      modalHeader: 'Test feedback'
    })
    this.showModal()
  }

  moderateTest(index, event) {
    event.preventDefault()
    console.log(this.state.tests[index])
    this.setState({
      modalMode: 'moderate test',
      testIndex: index,
      modalHeader: 'Test info'
    })
    this.showModal()
  }

  addTest(event) {
    event.preventDefault()
    this.setState({
      modalHeader: 'Create test',
      modalMode: 'test creation'
    })
    this.showModal()
  }

  render() {
    return (
      <div className="wrapper">
        <Modal
          modalHeader={this.state.modalHeader}
          renderContent={this.renderModalContent.bind(this)}
          renderHeader={this.renderModalHeader.bind(this)}
          visible={this.state.modalVisible}
        />
        <header className = {this.state.online ? 'headerOnline' : 'headerOffline'}>
          <h1>Testing environment</h1>
        </header>
        <div className="tests-card">
          <h2>Все тесты:</h2>
          <div className="tests">
            {this.state.tests.map((el, index) => {
              return (
                <div onClick = {this.moderateTest.bind(this, index)} className="test" key={index}>
                  {el.testName}
                </div>
              )
            })}
            <div onClick = {this.addTest.bind(this)} className="test add-test">+Add</div>
          </div>
        </div>
        <EvaluationCard evaluate = {this.evaluate.bind(this)} />
        <div className="queue-card">
          <div className="queue">
            <div className="record rhead">
              <div>Название файла</div>
              <div>Статус</div>
              <div>Policy</div>
            </div>
            {this.state.queue.map((el, index) => {
              if (!el.expanded) {
                return (
                  <div key={index} className="record-box">
                    <div
                      className="record"
                      onClick={this.expandRecord.bind(this, index)}
                    >
                      <div>{el.filename}</div>
                      <div>{el.status}</div>
                      <div>{el.policy}</div>
                    </div>
                  </div>
                )
              } else {
                return (
                  <div key={index} className="record-box">
                    <div
                      className="record expanded"
                      onClick={this.expandRecord.bind(this, index)}
                    >
                      <div>{el.filename}</div>
                      <div>{el.status}</div>
                      <div>{el.policy}</div>
                    </div>
                    <div className="full-feedback">
                      <div className="feedback-list">
                        {el.feedback.map((element, indexOfElement) => {
                          return (
                            <div
                              className="test-info"
                              key={indexOfElement}
                              onClick={this.showTestFeedback.bind(
                                this,
                                index,
                                indexOfElement
                              )}
                            >
                              <div>
                                {this.state.getTestNameById[element.testId]
                                  ? this.state.getTestNameById[element.testId]
                                  : 'Loading'}
                              </div>
                              <div className="test-status">
                                {element.status}
                              </div>
                              <div className="test-status">
                                {((element.time * 100) | 0) / 100} ms
                              </div>
                              <div className="test-status">
                                {element.exitCode}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              }
            })}
          </div>
        </div>
      </div>
    )
  }
}

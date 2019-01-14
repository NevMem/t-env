import React, { Component } from 'react'
import Preloader from './Preloader'
import PropTypes from 'prop-types'
import './moderateTestForm.css'

export default class ModerateTestForm extends Component {
  constructor(prps) {
    super(prps)
  }

  static propTypes = {
    test: PropTypes.shape({
      input: PropTypes.any,
      answer: PropTypes.any,
      testName: PropTypes.any,
      id: PropTypes.string.isRequired
    }),
    socket: PropTypes.any.isRequired,
    deleteTest: PropTypes.func.isRequired
  }

  render() {
    let { input, answer } = this.props.test
    if (input === undefined) {
      input = <Preloader isLoaded = {false} />
      this.props.socket.emit('get test input', {
        testId: this.props.test.id,
      })
    }
    if (answer === undefined) {
      answer = <Preloader isLoaded = {false} />
      this.props.socket.emit('get test answer', {
        testId: this.props.test.id,
      })
    }
    return (
      <div className='testModeration'>
        <div className='heading'>
          <h1>
            Test name: {this.props.test.testName}
          </h1>
          <h2>Test id: {this.props.test.id}</h2>
        </div>
        <div className='input-area'>
          <h3>Input:</h3>
          <div className='text-area'>{input}</div>
        </div>
        <div className='answer-area'>
          <h3>Answer:</h3>
          <div className='text-area'>{answer}</div>
        </div>
        <div className='centered fill-2-column'>
          <div
            onClick={this.props.deleteTest}
            className='btn btn-danger'
          >
            DELETE TEST
          </div>
        </div>
      </div>
    )
  }
}
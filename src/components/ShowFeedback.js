import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Preloader from './Preloader'

export default class ShowFeedback extends Component {
  constructor(prps) {
    super(prps)
  }

  static propTypes = {
    testName: PropTypes.string.isRequired,
    feedback: PropTypes.any.isRequired,
    test: PropTypes.any.isRequired,
    testId: PropTypes.string.isRequired,
    loadTestInput: PropTypes.func.isRequired,
    loadTestOutput: PropTypes.func.isRequired,
    loadTestAnswer: PropTypes.func.isRequired,
  }

  render() {
    let testName = 'Undefined'
    let timeConsumed = 'Undefined'
    let exitCode = 'Undefined'
    let status = 'Undefined'
    let input = 'Undefined'
    let output = 'Undefined'
    let answer = 'Undefined'

    let feedback = this.props.feedback
    let test = this.props.test

    if (this.props.testName)
      testName = this.props.testName

    if (feedback) {
      timeConsumed = feedback.time
      status = feedback.status
      output = feedback.stdout
      timeConsumed = feedback.time
      exitCode = feedback.exitCode
    }

    if (test) {
      input = test.input
      answer = test.answer
    }

    if (input === undefined) {
      input = <Preloader isLoaded = {false} />
      this.props.loadTestInput(this.props.testId)
    }
    if (answer === undefined) {
      answer = <Preloader isLoaded = {false} />
      this.props.loadTestAnswer(this.props.testId)
    }
    if (
      output === undefined ||
      (output !== undefined && output.length === 0)
    ) {
      if (output === undefined) {
        output = <Preloader isLoaded = {false} />
        this.props.loadTestOutput()
      } else {
        output = 'none'
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
}
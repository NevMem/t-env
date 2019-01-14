import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './testscard.css'

export default class TestsCard extends Component {
  constructor(prps) {
    super(prps)
  }

  render() { 
    return (
      <div className='tests-card'>
        <h2>Все тесты:</h2>
        <div className='tests'>
          {this.props.tests.map((el, index) => {
            return (
              <div
                onClick={this.props.moderateTest.bind(this, index)}
                className='test'
                key={index}
              >
                {el.testName}
              </div>
            )
          })}
          <div
            onClick={this.props.addTest}
            className='test add-test'
          >
            +Add
          </div>
        </div>
      </div>
    )
  }
}

TestsCard.propTypes = {
  tests: PropTypes.array.isRequired,
  moderateTest: PropTypes.func.isRequired,
  addTest: PropTypes.func.isRequired
}
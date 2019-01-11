import React, { Component } from 'react'
import PropTypes from 'prop-types'

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
                // onClick={this.moderateTest.bind(this, index)}
                className='test'
                key={index}
              >
                {el.testName}
              </div>
            )
          })}
          <div
            // onClick={this.addTest.bind(this)}
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
  tests: PropTypes.array.isRequired
}
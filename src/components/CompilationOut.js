import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import './compilation-out.css'

export default class CompilationOut extends Component {
  constructor(prps) {
    super(prps)
  }

  render() {
    return (
      <div className = 'compilation-out'>
        {this.props.content.split('\n').map((line, index) => {
          if (line.length !== 0)
            return <div key = {index}><div> {index}:</div><div>{line}</div></div>
          else
            return null
        })}
      </div>
    )
  }
}

CompilationOut.propTypes = {
  content: PropTypes.string.isRequired
}
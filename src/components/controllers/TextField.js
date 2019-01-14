import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './textfield.css'

export default class TextField extends Component {
  constructor(prps) {
    super(prps)
  }

  render() {
    let className = 'text-field'
    if (this.props.value.length !== 0)
      className += ' filled'
    return (
      <div className = 'input-group'>
        <input onChange = {this.props.onChange} id = {this.props.id} value = {this.props.value} className = {className} />
        <span>{this.props.label}</span>
      </div>
    )
  }
}

TextField.propTypes = {
 value: PropTypes.any.isRequired,
 onChange: PropTypes.func.isRequired,
 id: PropTypes.any.isRequired,
 label: PropTypes.string.isRequired
}
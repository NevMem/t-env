import React, { Component } from 'react'

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
        <span>{this.props.lable}</span>
      </div>
    )
  }
}
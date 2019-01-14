import React, { Component } from 'react'
import './customtoggler.css'

export default class CustomToggler extends Component {
  constructor(prps) {
    super(prps)
  }

  render() {
    let className = 'custom_toggler'
    if (this.props.toggled)
      className += ' toggled'
    return (
      <div className = {className} id = 'toggler'>
        <div className = 'first_caption'>{this.props.first_caption}</div>
        <span onClick = {this.props.toggle}></span>
        <div className = 'second_caption'>{this.props.second_caption}</div>
      </div>
    )
  }
}
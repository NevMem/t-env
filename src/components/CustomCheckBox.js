import React, { Component } from 'react'

export default class CustomCheckBox extends Component {
  constructor(prps) {
    super(prps)
  }

  render() {
    let class_name = 'custom_checkbox'
    if (this.props.active === true) {
      class_name += ' active'
    }
    return (
      <div className = {class_name}>
        <span onClick = {this.props.activate}></span>
        <div onClick = {this.props.activate}>{this.props.caption}</div>
      </div>
    )
  }
}
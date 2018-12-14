import React, { Component } from 'react'
import './modalStyles.css'

export default class Modal extends Component {
  constructor(prps) {
    super(prps)
  }

  render() {
    if (!this.props.visible) return null
    let content = this.props.renderContent()
    let header = this.props.renderHeader()
    return (
      <div className='modal-blur'>
        <div className='modal-core'>
          <div className='modal-header'>{header}</div>
          <div className='modal-content'>{content}</div>
        </div>
      </div>
    )
  }
}

import React, { Component } from 'react'
import './customrangeslider.css'

export default class CustomRangeSlider extends Component {
  constructor(prps) {
    super(prps)
    this.state = {
      min: 0,
      max: 1000, 
      current: 0
    }
  }

  dragStart(event) {
    console.log(event)
  }

  onDrag(event) {
    console.log(event)
  }

  dragEnd(event) {
    console.log(event)
  }

  render() {
    let left = (this.state.current - this.state.min) / (this.state.max - this.state.min)
    left = 'calc(11px + (100% - 36px) / ' + (this.state.max - this.state.min)  + ' * ' +  (this.state.current - this.state.min) + ')'
    return (
      <div className='slider'>
        <span
          draggable
          onDragStart={this.dragStart.bind(this)}
          onDrag = {this.onDrag.bind(this)}
          onDragEnd = {this.dragEnd.bind(this)}
          className='thumb'
          style = {{ left: left }}
        />
        <div className='track' />
      </div>
    )
  }
}

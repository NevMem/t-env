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

  getLeft = () => {
    let left = (this.state.current - this.state.min) / (this.state.max - this.state.min)
    left = 'calc(11px + (100% - 36px) / ' + (this.state.max - this.state.min)  + ' * ' +  (this.state.current - this.state.min) + ')'
    return left
  }

  dragStart = (event) => {
    event.preventDefault()
    document.addEventListener('mousemove', this.mouseMove)
    document.addEventListener('mouseup', this.mouseUp)
  }

  mouseMove = (event) => {
    event.stopPropagation()
    let rect = this.slider.getClientRects()[0]
    let workWidth = rect.width - 36
    let currentMove = event.clientX - rect.x - 11;
    if (currentMove < 0)
      currentMove = 0
    if (currentMove > workWidth)
      currentMove = workWidth
    this.setState({
      current: this.state.min + ((this.state.max - this.state.min) * currentMove / workWidth | 0)
    })
  }

  mouseUp = () => {
    document.removeEventListener('mousemove', this.mouseMove)
    document.removeEventListener('mouseup', this.mouseUp)
  }

  render() {
    let left = this.getLeft()
    return (
      <div className = 'range-slider-box'>
        <div className = 'range-slider-heading'>
          <div className = 'range-slider-min-value'>
            {this.state.min}
          </div>
          <div className = 'range-slider-current-value'>
            {this.state.current}
          </div>
          <div className = 'range-slider-max-value'>
            {this.state.max}
          </div>
        </div>
        <div ref = {rf => this.slider = rf } className='slider'>
          <span
            onMouseDown = {this.dragStart.bind(this)}
            className='thumb'
            style = {{ left: left }}
          />
          <div className='track' />
      </div>
      </div>
    )
  }
}

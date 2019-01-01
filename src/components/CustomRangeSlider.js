import React, { Component } from 'react'
import './customrangeslider.css'
import PropTypes from 'prop-types'

export default class CustomRangeSlider extends Component {
  constructor(prps) {
    super(prps)
    console.log(this.props)
  }

  getLeft = () => {
    let left = (this.props.current - this.props.min) / (this.props.max - this.props.min)
    left = 'calc(11px + (100% - 36px) / ' + (this.props.max - this.props.min)  + ' * ' +  (this.props.current - this.props.min) + ')'
    return left
  }

  dragStart = (event) => {
    event.preventDefault()
    document.addEventListener('mousemove', this.mouseMove)
    document.addEventListener('mouseup', this.mouseUp)
  }

  changeCurrentValue = (currentValue) => {
    this.props.handleChange(currentValue)
  }

  mouseMove = (event) => {
    event.stopPropagation()
    let rect = this.slider.getClientRects()[0]
    let workWidth = rect.width - 36
    let currentMove = event.clientX - rect.x - 11
    if (currentMove < 0)
      currentMove = 0
    if (currentMove > workWidth)
      currentMove = workWidth
    this.changeCurrentValue(this.props.min + ((this.props.max - this.props.min) * currentMove / workWidth | 0))
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
            {this.props.min}
          </div>
          <div className = 'range-slider-current-value'>
            {this.props.current}
          </div>
          <div className = 'range-slider-max-value'>
            {this.props.max}
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

CustomRangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  current: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired
}

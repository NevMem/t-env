import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './preloader.scss'

export default class Preloader extends Component {
  constructor(prps) {
    super(prps)
  }

  renderCols() {
    let res = []
    for (let i = 0; i != 16; ++i) {
      res.push(
        <div className = 'col' key = {i}></div>
      )
    }
    return res
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.isLoaded !== this.props.isLoaded)
      return true
    return false
  }

  render() {
    if (this.props.isLoaded)
      return null
    return (
      <div className = 'preloader-wrapper'>
        <div className = 'preloader'>
          {this.renderCols()}
        </div>
      </div>
    )
  }

  static propTypes = {
    isLoaded: PropTypes.bool.isRequired
  }
}
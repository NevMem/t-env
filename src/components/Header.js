import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './header.css'

export default class Header extends Component {
  constructor(prps) {
    super(prps)
  }

  render() {
    return (
      <header
        className={this.props.isOnline ? 'headerOnline' : 'headerOffline'}
      >
        <h1>Testing environment</h1>
      </header>
    )
  }
}

Header.propTypes = {
  isOnline: PropTypes.bool.isRequired
}
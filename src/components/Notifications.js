import React, { Component } from 'react'
import './notifications.css'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

const default_mx = 10

export default class Notifications extends Component {
  constructor(prps) {
    super(prps)
  }

  render() {
    if (this.props.notifications === undefined) return null
    let reversed = [...this.props.notifications]
    reversed.reverse()
    let maximum_count = default_mx
    if (this.props.maxCount !== undefined)
      maximum_count = this.props.maxCount
    return (
      <TransitionGroup className = 'notifications'>
        {reversed.map((el, index) => {
          if (index >= maximum_count)
            return null
          let heading = 'not found'
          if (el.heading !== undefined)
            heading = el.heading
          return (
              <CSSTransition
                classNames = 'notification'
                key = {reversed.length - index}
                timeout = {400}
              >
                <div className = {'notification notification-' + el.type}>
                  <div className = 'notificationTop'>
                    <div className = 'heading'>{heading}</div>
                    <div onClick = {this.props.delete.bind(this, index)} className = 'headingClose'></div>
                  </div>
                  <div className = 'notificationBody'>
                    {el.msg}
                  </div>
                </div>
              </CSSTransition>
          )
        })}
      </TransitionGroup>
    )
  }
}
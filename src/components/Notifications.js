import React, { Component } from 'react'
import './notifications.css'

const default_mx = 10

export default class Notifications extends Component {
  constructor(prps) {
    super(prps)
    console.log('Hello from Notifications constructor')
    console.log(this.props.notifications)
  }

  render() {
    if (this.props.notifications === undefined) return null
    let reversed = [...this.props.notifications]
    reversed.reverse()
    let maximum_count = default_mx
    if (this.props.maxCount !== undefined)
      maximum_count = this.props.maxCount
    return (
      <div className = 'notifications'>
        {reversed.map((el, index) => {
          if (index >= maximum_count)
            return null
          let heading = 'not found'
          if (el.heading !== undefined)
            heading = el.heading
          return (
            <div className = {'notification + notification-' + el.type} key = {index}>
              <div className = 'notificationTop'>
                <div className = 'heading'>{heading}</div>
                <div onClick = {this.props.delete.bind(this, index)} className = 'headingClose'></div>
              </div>
              <div className = 'notificationBody'>
                {el.msg}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
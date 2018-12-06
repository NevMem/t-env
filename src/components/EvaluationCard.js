import React, { Component } from 'react'
import CustomCheckBox from './CustomCheckBox'

export default class EvaluationCard extends Component {
  constructor(prps) {
    super(prps)
    this.state = {
      usage_O2: false
    }
  }

  toggle_O2() {
    this.setState({
      usage_O2: !this.state.usage_O2
    })
  }  

  render() {
    return (
      <div className = 'evaluation-card'>
        <div className = 'evaluation-settings'>
          <CustomCheckBox active = {this.state.usage_O2} activate = {this.toggle_O2.bind(this)} caption = 'Use -O2' />
        </div>
        <div className = 'evaluateButtonDiv'>
          <div className = 'evaluate-button' onClick = {this.props.evaluate}>
            Evaluate
          </div>
        </div>
      </div>
    )
  }
}
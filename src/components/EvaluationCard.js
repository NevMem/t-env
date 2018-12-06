import React, { Component } from 'react'
import CustomCheckBox from './CustomCheckBox'
import CustomToggler from './CustomToggler';

export default class EvaluationCard extends Component {
  constructor(prps) {
    super(prps)
    this.state = {
      usage_O2: false,
      usage_debug: false,
      usage_debug_pedantic: false,
      runType: 'single',
      runTypeToggled: false
    }
  }

  toggle_O2() {
    this.setState({
      usage_O2: !this.state.usage_O2
    })
  }

  toggle_usage_debug() {
    this.setState({
      usage_debug: !this.state.usage_debug
    })
  }

  toggle_usage_debug_pedantic() {
    this.setState({
      usage_debug_pedantic: !this.state.usage_debug_pedantic
    })
  }

  toggleRunType() {
    let newRunType = 'single'
    if (this.state.runType === 'single')
      newRunType = 'parallel'
    this.setState({
      runType: newRunType,
      runTypeToggled: (newRunType === 'parallel')
    })
  }

  render() {
    return (
      <div className = 'evaluation-card'>
        <div className = 'evaluation-settings'>
          <CustomCheckBox active = {this.state.usage_O2} activate = {this.toggle_O2.bind(this)} caption = 'Use -O2' />
          <CustomCheckBox active = {this.state.usage_debug} activate = {this.toggle_usage_debug.bind(this)} caption = 'Use -D_GLIBCXX_DEBUG' />
          <CustomCheckBox active = {this.state.usage_debug_pedantic} activate = {this.toggle_usage_debug_pedantic.bind(this)} caption = 'Use -D_GLIBCXX_DEBUG_PEDANTIC' />
          <div>
            <CustomToggler toggled = {this.state.runTypeToggled} toggle = {this.toggleRunType.bind(this)} first_caption = 'single' second_caption = 'parallel' />
          </div>
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
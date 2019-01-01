import React, { Component } from 'react'
import CustomCheckBox from './CustomCheckBox'
import CustomToggler from './CustomToggler'
import CustomRangeSlider from './CustomRangeSlider'
import PropTypes from 'prop-types'

export default class EvaluationCard extends Component {
  constructor(prps) {
    super(prps)
    this.state = {
      using_O2: false,
      using_glibcxx_debug: false,
      using_glibcxx_debug_pedantic: false,
      runType: 'single',
      runTypeToggled: false,
      timelimit: 1500
    }
  }

  toggle_O2() {
    this.setState({
      using_O2: !this.state.using_O2
    })
  }

  toggle_using_debug() {
    this.setState({
      using_glibcxx_debug: !this.state.using_glibcxx__debug
    })
  }

  toggle_using_debug_pedantic() {
    this.setState({
      using_glibcxx_debug_pedantic: !this.state.using_glibcxx_debug_pedantic
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

  handleTimeLimitChange(value) {
    this.setState({
      timelimit: value
    })
  }

  initEvaluation() {
    let evaluationSettings = {
      timelimit: this.state.timelimit,
      using_O2: this.state.using_O2,
      using_glibcxx_debug: this.state.using_glibcxx_debug,
      using_glibcxx_debug_pedantic: this.state.using_glibcxx_debug_pedantic,
      runType: this.state.runType
    }
    if (this.props.notify)
      this.props.notify({ type: 'info',
        heading: 'Evaluation Settings',
        msg: 'Evaluation request was successfully formed'
      })
    this.props.evaluate(evaluationSettings)
  }

  render() {
    return (
      <div className = 'evaluation-card'>
        <div className = 'evaluation-settings'>
          <CustomRangeSlider min = {200} max = {5000} current = {this.state.timelimit} handleChange = {this.handleTimeLimitChange.bind(this)} />
          <CustomCheckBox active = {this.state.using_O2} activate = {this.toggle_O2.bind(this)} caption = 'Use -O2' />
          <CustomCheckBox active = {this.state.using_debug} activate = {this.toggle_using_debug.bind(this)} caption = 'Use -D_GLIBCXX_DEBUG' />
          <CustomCheckBox active = {this.state.using_debug_pedantic} activate = {this.toggle_using_debug_pedantic.bind(this)} caption = 'Use -D_GLIBCXX_DEBUG_PEDANTIC' />
          <div>
            <CustomToggler toggled = {this.state.runTypeToggled} toggle = {this.toggleRunType.bind(this)} first_caption = 'single' second_caption = 'parallel' />
          </div>
        </div>
        <div className = 'evaluateButtonDiv'>
          <div className = 'evaluate-button' onClick = {this.initEvaluation.bind(this)}>
            Evaluate
          </div>
        </div>
      </div>
    )
  }
}

EvaluationCard.propTypes = {
  evaluate: PropTypes.func.isRequired
}
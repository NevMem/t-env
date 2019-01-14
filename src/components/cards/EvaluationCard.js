import React, { Component } from 'react'
import CustomCheckBox from '../controllers/CustomCheckBox'
import CustomToggler from '../controllers/CustomToggler'
import CustomRangeSlider from '../controllers/CustomRangeSlider'
import TextField from '../controllers/TextField'
import PropTypes from 'prop-types'
import './evaluation-card.css'

export default class EvaluationCard extends Component {
  constructor(prps) {
    super(prps)
    this.state = {
      using_O2: false,
      using_glibcxx_debug: false,
      using_glibcxx_debug_pedantic: false,
      runType: 'single',
      runTypeToggled: false,
      timelimit: 1500,
      path: 'default path',
    }
  }

  componentDidMount() {
    this.loadSettings()
  }

  __load_boolean_field(field_name) {
    if (
      localStorage.getItem(field_name) === 'true' ||
      localStorage.getItem(field_name) === 'false'
    )
      this.setState({
        [field_name]: localStorage.getItem(field_name) === 'true',
      })
  }

  __load_number_field(field_name, bounds) {
    let value = localStorage.getItem(field_name)
    if (value === null) return
    value = parseInt(value, 10)
    if (bounds && bounds[0] <= value && value <= bounds[1]) return
    this.setState({ [field_name]: value })
  }

  __load_string_field(field_name) {
    if (localStorage.getItem(field_name) !== null) {
      this.setState({ [field_name]: localStorage.getItem(field_name) })
    }
  }

  loadSettings() {
    this.__load_boolean_field('using_O2')
    this.__load_boolean_field('using_glibcxx_debug')
    this.__load_boolean_field('using_glibcxx_debug_pedantic')
    this.__load_boolean_field('runTypeToggled')
    this.__load_string_field('runType')
    this.__load_number_field('timelimit', [this.state.min, this.state.max])
    this.__load_string_field('path')
  }

  saveSettings() {
    localStorage.setItem('using_O2', this.state.using_O2)
    localStorage.setItem('runType', this.state.runType)
    localStorage.setItem('runTypeToggled', this.state.runTypeToggled)
    localStorage.setItem(
      'using_glibcxx_debug_pedantic',
      this.state.using_glibcxx_debug_pedantic,
    )
    localStorage.setItem('using_glibcxx_debug', this.state.using_glibcxx_debug)
    localStorage.setItem('timelimit', this.state.timelimit)
    localStorage.setItem('path', this.state.path)
  }

  toggle_O2() {
    this.setState(
      {
        using_O2: !this.state.using_O2,
      },
      () => {
        this.saveSettings()
      },
    )
  }

  toggle_using_debug() {
    console.log('Hello')
    this.setState(
      {
        using_glibcxx_debug: !this.state.using_glibcxx_debug,
      },
      () => {
        this.saveSettings()
      },
    )
  }

  toggle_using_debug_pedantic() {
    this.setState(
      {
        using_glibcxx_debug_pedantic: !this.state.using_glibcxx_debug_pedantic,
      },
      () => {
        this.saveSettings()
      },
    )
  }

  toggleRunType() {
    let newRunType = 'single'
    if (this.state.runType === 'single') newRunType = 'parallel'
    this.setState(
      {
        runType: newRunType,
        runTypeToggled: newRunType === 'parallel',
      },
      () => {
        this.saveSettings()
      },
    )
  }

  handleTimeLimitChange(value) {
    this.setState(
      {
        timelimit: value,
      },
      () => {
        this.saveSettings()
      },
    )
  }

  initEvaluation() {
    let evaluationSettings = {
      timelimit: this.state.timelimit,
      using_O2: this.state.using_O2,
      using_glibcxx_debug: this.state.using_glibcxx_debug,
      using_glibcxx_debug_pedantic: this.state.using_glibcxx_debug_pedantic,
      runType: this.state.runType,
      path: this.state.path,
    }
    if (this.props.notify)
      this.props.notify({
        type: 'info',
        heading: 'Evaluation Settings',
        msg: 'Evaluation request was successfully formed',
      })
    this.props.evaluate(evaluationSettings)
  }

  handleChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    }, () => {
      this.saveSettings()
    })
  }

  render() {
    return (
      <div className='evaluation-card'>
        <div className='evaluation-settings'>
          <div className = 'vertical-aligner'>
            <CustomRangeSlider
              min={200}
              max={5000}
              roundingTo={50}
              current={this.state.timelimit}
              handleChange={this.handleTimeLimitChange.bind(this)}
            />
          </div>
          <div className = 'vertical-aligner'>
            <CustomCheckBox
              active={this.state.using_O2}
              activate={this.toggle_O2.bind(this)}
              caption='Use -O2'
            />
          </div>
          <div className = 'vertical-aligner'>
            <CustomCheckBox
              active={this.state.using_glibcxx_debug}
              activate={this.toggle_using_debug.bind(this)}
              caption='Use -D_GLIBCXX_DEBUG'
            />
          </div>
          <div className = 'vertical-aligner'>
            <CustomCheckBox
              active={this.state.using_glibcxx_debug_pedantic}
              activate={this.toggle_using_debug_pedantic.bind(this)}
              caption='Use -D_GLIBCXX_DEBUG_PEDANTIC'
            />
          </div>
          <div className = 'vertical-aligner'>
            <CustomToggler
              toggled={this.state.runTypeToggled}
              toggle={this.toggleRunType.bind(this)}
              first_caption='single'
              second_caption='parallel'
            />
          </div>
          <div className = 'vertical-aligner'>
          <TextField
            value = {this.state.path}
            label = "evaluation path"
            id = "path"
            onChange = {this.handleChange.bind(this)}
          />
          </div>
        </div>
        <div className='evaluateButtonDiv'>
          <div
            className='evaluate-button'
            onClick={this.initEvaluation.bind(this)}
          >
            Evaluate
          </div>
        </div>
      </div>
    )
  }
}

EvaluationCard.propTypes = {
  evaluate: PropTypes.func.isRequired,
}

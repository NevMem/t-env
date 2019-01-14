import React, { Component } from 'react'
import TextField from './TextField'
import PropTypes from 'prop-types'
import './createTestForm.css'

export default class CreateTestForm extends Component {
  constructor(prps) {
    super(prps)
    this.state = {
      name: '',
      input: '',
      output: ''
    }
  }

  static propTypes = {
    socket: PropTypes.any.isRequired,
    closeModal: PropTypes.func.isRequired
  }

  handleChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    })
  }

  addTest() {
    let { input, output, name } = this.state
    if (!this.props.socket) {
      alert('Socket not found')
    } else {
      this.props.socket.emit('add test', {
        name: name,
        input: input,
        output: output
      })
      this.props.closeModal()
    }
  }

  render() {
    return (
      <div className = 'testCreation'>
        <TextField label = 'Enter test name' id = 'name' value = {this.state.name} onChange = {this.handleChange.bind(this)} />
        <div className = 'input-answer-fields'>
          <textarea onChange = {this.handleChange.bind(this)} id = 'input' value = {this.state.input} className = 'input'>
          </textarea>
          <textarea onChange = {this.handleChange.bind(this)} id = 'output' value = {this.state.output} className = 'output'>
          </textarea>
        </div>
        <div className = 'testCreationButtonDiv'>
          <div onClick = {this.addTest.bind(this)} className = 'btn'>Create test</div>
        </div>
      </div>
    )
  }
}
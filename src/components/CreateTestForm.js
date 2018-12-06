import React, { Component } from 'react'
import TextField from './TextField'

export default class CreateTestForm extends Component {
  constructor(prps) {
    super(prps)
    this.state = {
      name: 'srtn',
      input: '',
      output: ''
    }
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
    }
  }

  render() {
    return (
      <div className = 'testCreation'>
        <TextField lable = 'Test name' id = 'name' value = {this.state.name} onChange = {this.handleChange.bind(this)} />
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
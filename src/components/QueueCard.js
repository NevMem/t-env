import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CompilationOut from './CompilationOut'
import './queueCard.css'

export default class QueueCard extends Component { 
  constructor(prps) {
    super(prps)
  }

  static propTypes = {
    queue: PropTypes.array.isRequired,
    expandRecord: PropTypes.func.isRequired,
    showTestFeedback: PropTypes.func.isRequired,
    getTestNameById: PropTypes.func.isRequired,
  }

  render() {
    return (
      <div className='queue-card'>
        <div className='queue'>
          <div className='record rhead'>
            <div>File name</div>
            <div>Result</div>
            <div>Status</div>
            <div>Policy</div>
          </div>
          {this.props.queue.map((el, index) => {
            let fullCount = el.feedback.length
            let okCount = 0
            for (let i = 0; i !== el.feedback.length; ++i) {
              if (el.feedback[i].status === 'ok') {
                okCount += 1
              }
            }
            if (!el.expanded) {
              return (
                <div key={index} className='record-box'>
                  <div
                    className='record'
                    onClick={this.props.expandRecord.bind(this, index)}
                  >
                    <div>{el.filename}</div>
                    <div>{okCount}/{fullCount}</div>
                    <div>{el.status}</div>
                    <div>{el.policy}</div>
                  </div>
                </div>
              )
            } else {
              return (
                <div key={index} className='record-box'>
                  <div
                    className='record expanded'
                    onClick={this.props.expandRecord.bind(this, index)}
                  >
                    <div>{el.filename}</div>
                    <div>{okCount}/{fullCount}</div>
                    <div>{el.status}</div>
                    <div>{el.policy}</div>
                  </div>
                  <div className='full-feedback'>
                    <div className='feedback-summary'>
                      <div className = 'compilation-info'>
                        <div>compilation args:</div>
                        <div>{JSON.stringify(el.compilationArgs)}</div>
                      </div>
                      {el.compilation_out !== undefined && <CompilationOut content = {el.compilation_out} /> }
                      <div className = 'ok-count'>
                        <div>Result:</div>
                        <div>{okCount} / {fullCount}</div>
                      </div>
                    </div>
                    <div className='feedback-list'>
                      {el.feedback.map((element, indexOfElement) => {
                        return (
                          <div
                            className='test-info'
                            key={indexOfElement}
                            onClick={this.props.showTestFeedback.bind(
                              this,
                              index,
                              indexOfElement,
                            )}
                          >
                            <div>
                              {this.props.getTestNameById(element.testId)}
                            </div>
                            <div className='test-status'>
                              {element.status}
                            </div>
                            <div className='test-status'>
                              {((element.time * 100) | 0) / 100} ms
                            </div>
                            <div className='test-status'>
                              {element.exitCode}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            }
          })}
        </div>
      </div>
    )
  }
}
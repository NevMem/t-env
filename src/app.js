import React from 'react'
import { render } from 'react-dom'
import App from './Main.js'
import './main.css'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { RE_INIT, ADD_RECORD, TOGGLE_EXPANDING, ADD_STDOUT, CHANGE_STATUS } from './types.js';

const initialState = {
  queue: []
}

let reducer = (state = initialState, action) => {
  let { type, payload } = action
  if (type === RE_INIT) {
    return { ...initialState }
  }
  if (type === ADD_RECORD) {
    let new_state = { ...state, queue: [ payload, ...state.queue ] }
    return new_state
  }
  if (type === ADD_STDOUT) {
    let { queueIndex, testIndex, stdout } = payload
    return {
      ...state,
      queue: state.queue.map((el, index) => {
        if (index === state.queue.length - 1 - queueIndex) {
          return {
            ...el,
            feedback: el.feedback.map((element, index) => {
              if (index === testIndex) {
                return { ...element, stdout: stdout }
              }
              return element
            })
          }
        }
        return el
      })
    }
  }
  if (type === TOGGLE_EXPANDING) {
    return {
      ...state,
      queue: state.queue.map((el, index) => {
        if (index === payload.index) {
          return { ...el, expanded: !el.expanded }
        }
        return el
      })
    }
  }
  if (type === CHANGE_STATUS) {
    const { queueIndex, status } = payload
    return {
      ...state,
      queue: state.queue.map((el, index) => {
        if (index === state.queue.length - 1 - queueIndex)
          return { ...el, status: status }
        return el
      })
    }
  }
  console.log(type, payload)
  return { ...state }
}

let store = createStore(reducer)

const rootEl = document.getElementById('app')

render(
  <Provider store = {store}>
      <App/>
  </Provider>
  ,rootEl)

if (module.hot) {
  module.hot.accept()
}
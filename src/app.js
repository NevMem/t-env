import React from 'react'
import { render } from 'react-dom'
import App from './Main.js'
import './main.css'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

const initialState = {
  queue: []
}

let reducer = (state = initialState, action) => {
  let { type, payload } = action
  if (type === 'add record') {
    let new_state = { ...state, queue: [ payload, ...state.queue ] }
    return new_state
  }
  if (type === 'toggle expanding') {
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
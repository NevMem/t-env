import React from 'react'
import { render } from 'react-dom'
import App from './Main.js'
import './main.css'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

const rootEl = document.getElementById('app')

let reducer = (state = {}, action) => {
    let { type, payload } = action
    return { ...state }
}

let store = createStore(reducer)

render(
    <Provider store = {store}>
        <App/>
    </Provider>
    ,rootEl)

if (module.hot) {
    module.hot.accept()
}
import React, { Component } from 'react'
import openSocket from 'socket.io-client'

export default class App extends Component {
    constructor(prps) {
        super(prps)
        console.log('Hello')
        this.state = {
            socket: openSocket('http://localhost:80'),
            online: false, 
            tests: [], 
            queue: []
        }
        this.state.socket.on('connect', () => {
            console.log('connected')
            this.setState({ online: true, tests: [], queue: [] })
        })
        this.state.socket.on('new test', (test) => {
            console.log('new test', test)
            this.setState({ tests: [...this.state.tests, test ] })
        })
        this.state.socket.on('disconnect', () => {
            console.log('disconnected')
            this.setState({ online: false })
        })
    }

    render() {
        console.log(this.state.online)
        return (
            <div className = 'wrapper'>
                <header>
                    <h1>Testing environment{ this.state.online && <span>online</span> }</h1>
                </header>
                <div className = 'tests'>
                    {this.state.tests.map((el, index) => {
                        return (
                            <div className = 'testButton' key = {index}>
                                {el.testName}
                            </div>
                        )
                    })}
                </div>
                <div className = 'card'>
                    <div className = 'queue'>
                    </div>
                </div>
            </div>
        )
    }
}
import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";

const WebSocket = require('isomorphic-ws')

const ws = new WebSocket('ws://localhost:5001/');

export class WebSocketApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: ''};
    }

    componentDidMount() {
        ws.onopen = function open(event) {
            console.log('connected');
            setTimeout(function () {
                ws.send('hey!')
            }, 1000)
        };

        ws.onclose = function close() {
            console.log('disconnected');
        };

        ws.onmessage = function incoming(message) {
            console.log("message:" + message.data);
        };

        const b = fetch('http://127.0.0.1:8000/websocket/data', {method: 'GET'})
            .then(response => response.json() )
            .then(response =>
                response.map(ab => this.setState({messages: [...this.state.messages, ab]}))
            )
    }

    render() {
        return (
            <div>
                Messages:
                <ul>
                    {this.state.messages.map(message =>
                        <li key={message.timestamp}>{message.timestamp} - <strong>{message.username}</strong>: {message.message}</li>
                    )}
                </ul>

                <div>
                    <form onSubmit={event => this.handleSubmit(event)}>
                        <input type="text" id="text" name="name" onChange={event => this.setState({newMessage: event.target.value})} value={this.state.newMessage} />
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
            </div>
        );
    }

    handleSubmit(event) {
        fetch(
            '/websocket/save',
            {method: 'POST', body: httpBuildQuery({message: this.state.newMessage}), headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
        )
        const text = document.getElementById('text').value
        console.log(this.state.newMessage)
        ws.send(text)
        event.preventDefault();
    }
}
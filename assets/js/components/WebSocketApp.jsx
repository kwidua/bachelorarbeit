import * as React from "react";

const WebSocket = require('isomorphic-ws')
const ws = new WebSocket('wss://echo.websocket.org/');

export class WebSocketApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: ''};
    }

    componentDidMount() {
        ws.onopen = function open() {
            console.log('connected');
            ws.send(Date.now());
        };

        ws.onclose = function close() {
            console.log('disconnected');
        };

        ws.onmessage = function incoming(data) {
            console.log(`message`);
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

                <div>
                    <form onSubmit={event => this.handleSubmit(event)}>
                        <input type="text" name="name" onChange={event => this.setState({newMessage: event.target.value})} value={this.state.newMessage} />
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
            </div>
        );
    }

    handleSubmit(event) {
        console.log(event)
        this.setState({newMessage: ''})

        event.preventDefault();
    }
}
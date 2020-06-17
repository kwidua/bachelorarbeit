import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";

var urlParams = new URLSearchParams(window.location.search);
var channelName = urlParams.get('channel');
const ws = new WebSocket('ws://localhost:4000/subscribe?topic=' + channelName);

export class WebSocketApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: '', channel: null};
    }

    componentDidMount() {
        // var urlParams = new URLSearchParams(window.location.search);
        // var channelName = urlParams.get('channel');
        this.setState({channel: channelName})

        ws.onopen = function open(event) {
            console.log('ws connected');
        };

        ws.onclose = function close() {
            console.log('ws disconnected');
        };

        ws.onmessage = (message) => {
            const newMessage = JSON.parse(message.data)
            this.setState({messages: [...this.state.messages, newMessage]})
        };

        const b = fetch('http://localhost:8000/websocket/data?channel=' + channelName, {method: 'GET'})
            .then(response => response.json())
            .then(response =>
                response.map(ab => this.setState({messages: [...this.state.messages, ab]}))
            )
    }

    render() {
        return (
            <div>
                Messages:
                <ul id="ul">
                    {this.state.messages.map(message =>
                        <li key={message.timestamp}>{message.timestamp} - <strong>{message.username}</strong>: {message.message}
                        </li>
                    )}
                </ul>

                <div>
                    <form onSubmit={event => this.handleSubmit(event)}>
                        <input type="text" id="text" name="name"
                               onChange={event => this.setState({newMessage: event.target.value})}
                               value={this.state.newMessage}/>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
            </div>
        );
    }

    handleSubmit(event) {
        (async () => {
            const rawResponse = await fetch(
                '/websocket/save?channel=' + this.state.channel,
                {
                    method: 'POST',
                    body: httpBuildQuery({message: this.state.newMessage}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }
            )
            const content = await rawResponse.json()
            ws.send(JSON.stringify(content))
        })()

        event.preventDefault();
    }
}
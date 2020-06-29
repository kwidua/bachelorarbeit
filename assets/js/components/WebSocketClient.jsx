import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";
import {TestTimings} from "./TestTimings";

var urlParams = new URLSearchParams(window.location.search);
var channelName = urlParams.get('channel');
const ws = new WebSocket('ws://localhost:4000/subscribe?topic=' + encodeURIComponent('channels/' + channelName));

export class WebSocketClient extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: '', channel: null, testTimings: []};
    }

    componentDidMount() {
        this.setState({channel: channelName})

        ws.onopen = function open(event) {
            console.log('ws connected');
        };

        ws.onclose = function close() {
            console.log('ws disconnected');
        };

        ws.onmessage = (message) => {
            const newMessage = JSON.parse(message.data)
            this.recordTestTimings(newMessage)
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
                    <TestTimings url={'/mercure/publish?channel=' + this.state.channel} testTimings={this.state.testTimings}/>
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

    recordTestTimings(data) {
        if (!data.message.startsWith('RealtimeTest:')) {
            return
        }
        const timestampSend = data.message.split(':')
        const difference = (new Date().getTime()) - parseInt(timestampSend[1])
        this.setState({testTimings: [...this.state.testTimings, difference]})
    }
}
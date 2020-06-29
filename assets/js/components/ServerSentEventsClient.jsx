import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";
import {TestTimings} from "./TestTimings";


export class ServerSentEventsClient extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: '', channel: null, testTimings: []}
    }

    componentDidMount() {
        var urlParams = new URLSearchParams(window.location.search);
        var channelName = urlParams.get('channel');
        this.setState({channel: channelName})

        this.fetchChatHistoryFromApplicationBackend(channelName)
        this.initializeEventSourceToSseHub(channelName)
    }

    render() {
        return <div>
            <ul>
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
    }

    handleSubmit(event) {
        fetch(
            '/sse/save?channel=' + this.state.channel,
            {
                method: 'POST',
                body: httpBuildQuery({message: this.state.newMessage}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }
        )

        this.setState({newMessage: ''})

        event.preventDefault();
    }

    fetchChatHistoryFromApplicationBackend(channelName) {
        const b = fetch('http://localhost:8000/sse/data?channel=' + channelName, {method: 'GET'})
            .then(response => response.json())
            .then(response =>
                response.map(ab => this.setState({messages: [...this.state.messages, ab]}))
            )
            .catch(error => {
                alert('Cannot access Messages')
            })
    }

    initializeEventSourceToSseHub(channelName)
    {
        const es = new EventSource("http://localhost:5000/subscribe?topic=" + encodeURIComponent('channels/' + channelName),
            {withCredentials: true})

        es.onopen = function () {
            console.log('SSE connection open')
        }
        es.onmessage = (event) => {
            const newMessage = JSON.parse(event.data)
            this.recordTestTimings(newMessage)
            this.setState({messages: [...this.state.messages, newMessage]})
        }

        es.onerror = function (error) {
            es.close()
        };

        es.onclose = function () {
            console.log('SSE conenction closing')
        }
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
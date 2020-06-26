import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";

export class MercureClient extends React.Component {
    constructor(props) {
        super(props);
        this.eventSource = null;
        this.state = {messages: [], newMessage: '', channel: null, testRunning: false, testTimings: []}
    }

    componentDidMount() {
        var urlParams = new URLSearchParams(window.location.search);
        var channelName = urlParams.get('channel');
        this.setState({channel: channelName})

        this.eventSource = new EventSource(
            'http://localhost:3000/.well-known/mercure?topic=' + encodeURIComponent('channels/' + channelName),
            {withCredentials: true}
        );

        this.eventSource.onmessage = event => {
            // Will be called every time an update is published by the server
            const data = JSON.parse(event.data)
            this.recordTestTimings(data)
            this.setState({messages: [...this.state.messages, data]})
        }

        const b = fetch('http://localhost:8000/mercure/data?channel=' + channelName, {method: 'GET'})
            .then(response => response.json() )
            .then(response =>
                response.map(ab => this.setState({messages: [...this.state.messages, ab]}))
            )
            .catch(error => {
                alert('Cannot access Messages')
            })
    }

    componentWillUnmount() {
        if (this.eventSource) {
            this.eventSource.close();
        }
    }

    render() {

        return <div>
            <ul>
                {this.state.messages.map(message =>
                    <li key={message.id}>{message.timestamp} - <strong>{message.username}</strong>: {message.message}</li>
                )}
            </ul>

            <div>
                <form onSubmit={event => this.handleSubmit(event)}>
                    <input type="text" name="name" onChange={event => this.setState({newMessage: event.target.value})} value={this.state.newMessage} />
                    <input type="submit" value="Submit"/>
                </form>
                <button onClick={event => this.sendRealtimeTestMessages(event)} disabled={this.state.testRunning}>{this.state.testRunning ? 'Realtime Test is running' : 'Start Realtime Test'}</button>
                {'last Test Average:' + this.getAverageTestTimings() + 'ms'}
            </div>
        </div>
    }

    handleSubmit(event) {
        fetch(
            '/mercure/publish?channel=' + this.state.channel,
            {method: 'POST', body: httpBuildQuery({message: this.state.newMessage}), headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
            )

        this.setState({newMessage: ''})

        event.preventDefault();
    }

    sendRealtimeTestMessages(event) {
        this.setState({testRunning: true, testTimings: []})

        let count = 0
        let id
        id = setInterval(() => {
            count++
            fetch(
                '/mercure/publish?channel=' + this.state.channel,
                {method: 'POST', body: httpBuildQuery({message: 'RealtimeTest:' + (new Date().getTime())}), headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
            )
            if (count === 100) {
                clearInterval(id)
                this.setState({testRunning: false})
            }
        }, 250)
    }

    recordTestTimings(data) {
        if (!data.message.startsWith('RealtimeTest:')) {
            return
        }
        const timestampSend = data.message.split(':')
        const difference = (new Date().getTime()) - parseInt(timestampSend[1])
        this.setState({testTimings: [...this.state.testTimings, difference]})
    }

    getAverageTestTimings() {
        return this.state.testTimings.reduce((a,b) => a + b, 0) / this.state.testTimings.length
    }

}
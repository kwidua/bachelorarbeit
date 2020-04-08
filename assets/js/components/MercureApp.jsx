import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";

export class MercureApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: ''}
    }

    componentDidMount() {
        const es = new EventSource('http://localhost:3000/.well-known/mercure?topic=' + encodeURIComponent('http://example.com/files/1'));
        es.onmessage = e => {
            // Will be called every time an update is published by the server
            const data = JSON.parse(e.data)
            const b = fetch('http://127.0.0.1:8000/mercure/data', {method: 'GET'}).then(response => response.json())
            this.setState({messages: [...this.state.messages, data]})
        }
    }

    render() {

        return <div>
            <h2>Channel: </h2>

            <ul>
                {this.state.messages.map(message =>
                    <li key={message.timestamp}>{message.timestamp} - <strong>{message.username}</strong>: {message.message}</li>
                )}
            </ul>

            <div>
                <form onSubmit={event => this.handleSubmit(event)}>
                    <input type="text" name="name" onChange={event => this.setState({newMessage: event.target.value})} value={this.state.newMessage} />
                    <input type="submit" value="Submit"/>
                </form>
            </div>
        </div>
    }

    handleSubmit(event) {
        fetch(
            '/mercure/publish?message',
            {method: 'POST', body: httpBuildQuery({message: this.state.newMessage}), headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
            )

        this.setState({newMessage: ''})

        event.preventDefault();
    }

}

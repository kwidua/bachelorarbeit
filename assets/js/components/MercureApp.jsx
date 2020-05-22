import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";

export class MercureApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: ''}
    }

    componentDidMount() {
        this.es = new EventSource('http://localhost:3000/.well-known/mercure?topic=' + encodeURIComponent('http://example.com/files/1'), {withCredentials: true});

        es.onmessage = event => {
            // Will be called every time an update is published by the server
            const data = JSON.parse(event.data)
            console.log(data)
            this.setState({messages: [...this.state.messages, data]})
        }

        const b = fetch('https://localhost:8000/mercure/data', {method: 'GET'})
            .then(response => response.json() )
            .then(response =>
                response.map(ab => this.setState({messages: [...this.state.messages, ab]}))
            )
    }

    render() {

        return <div>
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

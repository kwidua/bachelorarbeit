import * as React from "react";

export class MercureApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: []}
    }

    componentDidMount() {
        console.log('mount')
        const es = new EventSource('http://localhost:3000/.well-known/mercure?topic=' + encodeURIComponent('http://example.com/files/1'));
        es.onmessage = e => {
            // Will be called every time an update is published by the server
            const data = JSON.parse(e.data)
            console.log(data)
            this.setState({messages: [...this.state.messages, data]})
        }
    }

    render() {

        return <div>
            <ul>
                {this.state.messages.map(message =>
                    <li key={message.timestamp}>{message.username}: {message.message} : {message.timestamp}</li>
                )}
            </ul>
        </div>
    }
}

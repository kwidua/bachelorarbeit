import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";

export class XhrPollingClient extends React.Component{
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: '', channel: null}
    }

    componentDidMount() {
        var urlParams = new URLSearchParams(window.location.search);
        var channelName = urlParams.get('channel');
        this.setState({channel: channelName})

        this.fetchChatHistoryFromApplicationBackend(channelName)

        setInterval(() => {
            this.fetchChatHistoryFromApplicationBackend(channelName)
        }, 10000)
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
            </div>
        </div>
    }

    handleSubmit(event) {
        fetch(
            'http://localhost:8000/xhr/save?channel=' + this.state.channel,
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
        const b = fetch('http://localhost:8000/xhr/data?channel=' + channelName, {method: 'GET'})
            .then(response => response.json())
            .then(response =>
                this.setState({messages: response})
            )
            .catch(error => {
                alert('Cannot access Messages')
            })
    }
}
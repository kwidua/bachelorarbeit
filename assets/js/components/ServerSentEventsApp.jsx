import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";


export class ServerSentEventsApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: ''}
    }

    componentDidMount() {
        const es = new EventSource("http://localhost:5000")

        es.onopen = function () {
            console.log('this time open')
        }
        es.onmessage = function (message) {
            console.log("message")
            const newMessage = JSON.parse(message.data)
            this.setState({messages: [...this.state.messages, newMessage]})

        }

        es.onerror = function (error) {
            console.log(error)
            es.close()
        };

        es.onclose = function () {
            console.log('conenction closing')
        }
        const b = fetch('http://127.0.0.1:8000/sse/data', {method: 'GET'})
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
                    <input type="text" id="text" name="name"
                           onChange={event => this.setState({newMessage: event.target.value})}
                           value={this.state.newMessage}/>
                    <input type="submit" value="Submit"/>
                </form>
            </div>
        </div>
    }

    handleSubmit(event) {
        // (async () => {
        //     const rawResponse = await
                fetch(
                '/sse/save',
                {
                    method: 'POST',
                    body: httpBuildQuery({message: this.state.newMessage}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }
            )
            // const content = await rawResponse.json()
            // console.log(content)
            // fetch('http://localhost:5000/sse/test', {method: 'POST', body: content, headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        // })()

        this.setState({newMessage: ''})

        event.preventDefault();
    }

}
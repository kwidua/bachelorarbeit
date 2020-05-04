import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";

export class ServerSentEventsApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: ''}
    }

    componentDidMount() {
        this.eventSource = new EventSource("http://localhost:8000/sse")

        this.eventSource.onmessage = message =>
            console.log(message.data)
    }

    render() {
        return <div>
            {/*<ul>*/}
            {/*    {this.state.messages.map(message =>*/}
            {/*        <li key={message.timestamp}>{message.timestamp} - <strong>{message.username}</strong>: {message.message}</li>*/}
            {/*    )}*/}
            {/*</ul>*/}

            <div>
                <form onSubmit={event => this.handleSubmit(event)}>
                    <input type="text" name="name" />
                    <input type="submit" value="Submit"/>
                </form>
            </div>
        </div>
    }

    handleSubmit(event) {

    }

}
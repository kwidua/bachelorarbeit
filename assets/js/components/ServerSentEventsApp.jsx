import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";

export class ServerSentEventsApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], newMessage: ''}
    }

    componentDidMount() {

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
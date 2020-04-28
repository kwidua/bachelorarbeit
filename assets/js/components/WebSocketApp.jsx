import * as React from "react";
import socketIOClient from "socket.io-client"
// const socket = socketIOClient("http://localhost:8080")
// var ws = new WebSocket("ws://localhost:8080");

export class WebSocketApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: []};
    }

    componentDidMount() {
        // socket.onopen = () => {
        //     console.log('WebSocket Client Connected');
        // };
        //
        // socket.onmessage = (message) => {
        //     console.log('hi');
        // };

        // ws.onopen = function(e) {
        //     console.log("Connection open...");
        // };

        // ws.onclose = function (e) {
        //     console.log("Connection closed...");
        // }

        // client.onmessage = (message) => {
        //     const dataFromServer = JSON.parse(message.data);
        //     const stateToChange = {};
        //     if (dataFromServer.type === "userevent") {
        //         stateToChange.currentUsers = Object.values(dataFromServer.data.users);
        //     } else if (dataFromServer.type === "contentchange") {
        //         stateToChange.text = dataFromServer.data.editorContent || contentDefaultMessage;
        //     }
        //     stateToChange.userActivity = dataFromServer.data.userActivity;
        //     this.setState({
        //         ...stateToChange
        //     });
        // };

    }

    render() {
        return (
            <div>
                Messages:

                <div>
                    <form onSubmit={event => socket.emit("message", "12345")}>
                        <input type="text" name="name" onChange={event => this.setState({newMessage: event.target.value})} value={this.state.newMessage} />
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
            </div>
        );
    }
}
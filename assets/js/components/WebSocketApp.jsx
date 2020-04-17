import * as React from "react";
import socketIOClient from "socket.io-client"
const socket = socketIOClient("http://localhost:8080")

export class WebSocketApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: []};
    }

    componentDidMount() {
        socket.onopen = () => {
            console.log('WebSocket Client Connected');
        };

        socket.onmessage = (message) => {
            console.log('hi');
        };

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
            </div>
        );
    }
}
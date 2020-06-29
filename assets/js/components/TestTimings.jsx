import * as React from "react";
import httpBuildQuery from "../utils/httpBuildQuery";
// import PropTypes from 'prop-types'

export class TestTimings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {testRunning: false}
    }

    // static propTypes = {
    //     url: PropTypes.string,
    //     testTimings: []
    // }

    render() {
        return <div>
        <button onClick={event => this.sendRealtimeTestMessages(event)} disabled={this.state.testRunning}>{this.state.testRunning ? 'Realtime Test is running' : 'Start Realtime Test'}</button>
        {'last Test Average:' + this.getAverageTestTimings() + 'ms'}
        </div>
    }

    sendRealtimeTestMessages(event) {
        this.setState({testRunning: true})

        let count = 0
        let id
        id = setInterval(() => {
            count++
            fetch(
                this.props.url,
                {method: 'POST', body: httpBuildQuery({message: 'RealtimeTest:' + (new Date().getTime())}), headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
            )
            if (count === 100) {
                clearInterval(id)
                this.setState({testRunning: false})
            }
        }, 250)
    }

    getAverageTestTimings() {
        return this.props.testTimings.reduce((a,b) => a + b, 0) / this.props.testTimings.length
    }
}

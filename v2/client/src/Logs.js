import React from "react"
import { withWrapper } from "./componentWrapper.js"

class Logs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="logs-page">
                This is the logs page
            </div>
        )
    }
}

export default withWrapper(Logs);
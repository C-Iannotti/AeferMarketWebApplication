import React from "react"
import { withWrapper } from "./componentWrapper.js"

class Data extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="data-page">
                This is the data page
            </div>
        )
    }
}

export default withWrapper(Data);
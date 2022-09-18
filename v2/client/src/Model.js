import React from "react"
import { withWrapper } from "./componentWrapper.js"

class Model extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="model-page">
                <button type="button">Retrieve Old Model</button>
                <button type="button">Train model</button>
                <button type="button">Reinitialize Model</button>
            </div>
        )
    }
}

export default withWrapper(Model);
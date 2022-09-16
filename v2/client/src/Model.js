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
                This is the model page
            </div>
        )
    }
}

export default withWrapper(Model);
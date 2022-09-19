import React from "react";
import { withWrapper } from "./componentWrapper.js";
import {
    replaceModelData,
    appendModelData
} from "./utils.js";

class Model extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.replaceModelData = replaceModelData.bind(this);
        this.appendModelData = appendModelData.bind(this);
        this.handleAppendModel = this.handleAppendModel.bind(this);
        this.handleReplaceModel = this.handleReplaceModel.bind(this);
    }
    handleAppendModel() {
        this.appendModelData((err, res) => {
            if (err) console.error(err);
            else {
                console.log(res);
            }
        })
    }

    handleReplaceModel() {
        this.replaceModelData((err, res) => {
            if (err) console.error(err);
            else {
                console.log(res);
            }
        })
    }

    render() {
        return (
            <div className="model-page">
                <button type="button">Retrieve Old Model</button>
                <button type="button">Train model</button>
                <button type="button">Reinitialize Model</button>
                <button type="button" onClick={this.handleAppendModel}>Append Data</button>
                <button type="button" onClick={this.handleReplaceModel}>Replace Data</button>
            </div>
        )
    }
}

export default withWrapper(Model);
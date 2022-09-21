import React from "react";
import { withWrapper } from "./componentWrapper.js";
import {
    replaceModelData,
    appendModelData,
    incrementModel,
    remakeModel,
    retrieveModel
} from "./utils.js";

class Model extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.replaceModelData = replaceModelData.bind(this);
        this.appendModelData = appendModelData.bind(this);
        this.incrementModel = incrementModel.bind(this);
        this.remakeModel = remakeModel.bind(this);
        this.retrieveModel = retrieveModel.bind(this);
        this.handleAppendModelData = this.handleAppendModelData.bind(this);
        this.handleReplaceModelData = this.handleReplaceModelData.bind(this);
        this.handleIncrementModel = this.handleIncrementModel.bind(this);
        this.handleRemakeModel = this.handleRemakeModel.bind(this);
        this.handleRetrieveModel = this.handleRetrieveModel.bind(this);
    }
    handleAppendModelData() {
        this.appendModelData((err, res) => {
            if (err) console.error(err);
            else {
                console.log(res);
            }
        });
    }

    handleReplaceModelData() {
        this.replaceModelData((err, res) => {
            if (err) console.error(err);
            else {
                console.log(res);
            }
        });
    }

    handleIncrementModel() {
        this.incrementModel((err, res) => {
            if (err) console.error(err);
            else {
                console.log(res);
            }
        });
    }

    handleRemakeModel() {
        this.remakeModel((err, res) => {
            if (err) console.error(err);
            else {
                console.log(res);
            }
        });
    }

    handleRetrieveModel() {
        this.retrieveModel((err, res) => {
            if (err) console.error(err);
            else {
                console.log(res);
            }
        });
    }

    render() {
        return (
            <div className="model-page">
                <button type="button" onClick={this.handleRetrieveModel}>Retrieve Old Model</button>
                <button type="button" onClick={this.handleIncrementModel}>Train model</button>
                <button type="button" onClick={this.handleRemakeModel}>Reinitialize Model</button>
                <button type="button" onClick={this.handleAppendModelData}>Append Data</button>
                <button type="button" onClick={this.handleReplaceModelData}>Replace Data</button>
            </div>
        )
    }
}

export default withWrapper(Model);
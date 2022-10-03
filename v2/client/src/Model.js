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

    componentDidMount() {
        this.props.checkLogin((err, res) => {
            if (err) {
                this.props.navigate("/login");
            }
            else {
                let date = new Date();
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        
                date.setMilliseconds(null);
                date.setSeconds(null);

                this.setState({defaultTime: date.toISOString().slice(0, -1)});
            }
        });
    }

    handleAppendModelData() {
        this.appendModelData((err, res) => {
            if (err) {
                this.setState({message: "Failed to format new data for model."});
            }
            else {
                console.log(res);
                this.setState({message: "Formatted new data for model."});
            }
            if (document.getElementById("model-page-action-button")) document.getElementById("model-page-action-button").removeAttribute("disabled");
        });
    }

    handleReplaceModelData() {
        this.replaceModelData((err, res) => {
            if (err) {
                this.setState({message: "Failed to reformat data for model."});
            }
            else {
                this.setState({message: "Reformatted data for model."});
            }
            if (document.getElementById("model-page-action-button")) document.getElementById("model-page-action-button").removeAttribute("disabled");
        });
    }

    handleIncrementModel() {
        this.incrementModel((err, res) => {
            if (err) {
                this.setState({message: "Failed to train model."});
            }
            else {
                this.setState({message: "Trained model with new Accuracy: " + res.data.trainAccuracy});
            }
            if (document.getElementById("model-page-action-button")) document.getElementById("model-page-action-button").removeAttribute("disabled");
        });
    }

    handleRemakeModel() {
        this.remakeModel((err, res) => {
            if (err) {
                this.setState({message: "Failed to reinitialize model."});
            }
            else {
                this.setState({message: "Reinitialized model with Accuracy: " + res.data.trainAccuracy});
            }
            if (document.getElementById("model-page-action-button")) document.getElementById("model-page-action-button").removeAttribute("disabled");
        });
    }

    handleRetrieveModel() {
        let searchDate = document.getElementById("model-retrieval-date").value
        this.retrieveModel(searchDate, (err, res) => {
            if (err) {
                this.setState({message: "Failed to retrieve model."});
            }
            else {
                this.setState({message: "Retrieved model with id: " + res.data.id + " and timestamp: " + res.data.timestamp})
            }
            if (document.getElementById("model-page-action-button")) document.getElementById("model-page-action-button").removeAttribute("disabled");
        });
    }

    handleModelAction() {
        let modelAction = document.getElementById("model-page-action-input").value;
        document.getElementById("model-page-action-button").setAttribute("disabled", true);
        
        if (modelAction === "formatNewData") this.handleAppendModelData();
        else if (modelAction === "replaceData") this.handleReplaceModelData();
        else if (modelAction === "reinitializeModel") this.handleRemakeModel();
        else if (modelAction === "trainModel") this.handleIncrementModel();
        else this.handleRetrieveModel();
    }

    render() {
        if (this.props.authenticated) {
            return (
                <div className="model-page">
                    <div className="model-page-action">
                        <select id="model-page-action-input" className="model-page-action-input" onChange={e => {
                            this.setState({modelAction: e.target.value})
                        }}>
                            <option value="formatNewData">Format New Data</option>
                            <option value="replaceData">Replace Data</option>
                            <option value="reinitializeModel">Reinitialize Model</option>
                            <option value="trainModel">Train Model</option>
                            <option value="retrieveOldModel">Retrieve Old Model</option>
                        </select>
                        {this.state.modelAction === "retrieveOldModel" &&
                            <input type="datetime-local" id="model-retrieval-date" className="model-retrieval-date" defaultValue={this.state.defaultTime}/>
                        }
                        <button type="button" id="model-page-action-button" onClick={() => {this.handleModelAction()}}>Start</button>
                    </div>
                    {this.state.message && <p className="model-page-message">{this.state.message}</p>}
                </div>
            )
        }
        else {
            return (
                <div id="authentication-page" className="authentication-page">
                    <p>Waiting to be authenticated...</p>
                </div>
            )
        }
    }
}

export default withWrapper(Model);
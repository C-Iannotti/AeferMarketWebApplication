import React from "react"
import { withWrapper } from "./componentWrapper.js"
import {
    getLogData
} from "./utils.js"

class Logs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNumber: 0
        };

        this.getLogData = getLogData.bind(this);
    }

    componentDidMount() {
        this.props.checkLogin((err, res) => {
            if (err) {
                this.props.navigate("/login");
            }
            else {
                this.handleRetrieveLogs(0);
            }
        })
    }

    handleRetrieveLogs(pageNumber) {
        this.getLogData(pageNumber, (err, res) => {
            if (err) console.error(err);
            else {
                console.log(res);
                this.setState({ pageNumber, logData: res.data.results })
            }
        })
    }

    render() {
        return (
            <div className="logs-page">
                <input id="page-number-input" type="text" />
                <
            </div>
        )
    }
}

export default withWrapper(Logs);
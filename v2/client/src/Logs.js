import React from "react"
import { withWrapper } from "./componentWrapper.js"
import {
    getTableData
} from "./utils.js"

class Logs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNumber: 0,
            pageNumberInput: 0
        };

        this.getTableData = getTableData.bind(this);
        this.handlePageInputEvent = this.handlePageInputEvent.bind(this);
        this.handleRetrieveLogs = this.handleRetrieveLogs.bind(this);
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
        for (let node of document.getElementsByClassName("display-arrow")) {
            node.setAttribute("disabled", true);
        }
        this.getTableData("Logs", undefined, undefined, pageNumber, (err, res) => {
            if (err) {
                console.error(err);
                this.setState({pageNumberInput: this.state.pageNumber});
            }
            else {
                console.log(res);
                for (let node of document.getElementsByClassName("display-arrow")) {
                    node.removeAttribute("disabled");
                }
                if (res.data.results.length > 0) {
                    this.setState({
                        pageNumber,
                        logData: res.data.results,
                        columns: res.data.columns,
                        pkColumns: res.data.pkColumns
                    });
                }
            }
        })
    }

    handlePageInputEvent(e) {
        console.log(e.key)
        if (e.key === "Enter") {
            this.handleRetrieveLogs()
        }
    }

    getPageInputsHTML() {
        return (
            <div className="logs-page-inputs">
                <div className="display-arrow" onClick={() => this.handleRetrieveLogs(this.state.pageNumber - 1)}>&lt;</div>
                <input id="page-number-input" className="page-input" onKeyDown={this.handlePageInputEvent} value={this.state.pageNumberInput} onChange={e => this.setState({pageNumberInput: e.target.value})}  type="text" maxLength={9}/>
                <div className="display-arrow" onClick={() => this.handleRetrieveLogs(this.state.pageNumber + 1)}>&gt;</div>
            </div>
        )
    }

    render() {
        return (
            <div className="logs-page">
                {this.getPageInputsHTML()}
                <table id="query-table" key={this.state.curQueryTable}>
                    <thead id="query-table-header">
                        {this.state.columns &&
                        <tr>
                            {this.state.pkColumns && this.state.pkColumns.map(x => {
                                return <th key={x}>{x}</th>
                            })}
                            {this.state.columns.map(x => <th key={x} className="query-table-column">{x}</th>)}
                        </tr>
                        }
                    </thead>
                    <tbody id="query-table-body">{this.state.logData && this.state.logData.map((x, j) => {
                        return <tr key={j}>{x.map((y, i) => <td key={j + "_" + i} >{y}</td>)}</tr>
                    })}</tbody>
                </table>
                {this.getPageInputsHTML()}
            </div>
        )
    }
}

export default withWrapper(Logs);
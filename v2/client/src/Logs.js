import React from "react"
import { withWrapper } from "./componentWrapper.js"
import Loading from "./Loading.js"
import {
    getTableData
} from "./utils.js"

/*
 * A React component for displaying the log data and
 * the UI component for interacting with it.
 */
class Logs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNumber: 1,
            pageNumberInput: 1
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
                this.handleRetrieveLogs(this.state.pageNumber);
            }
        })
    }

    handleRetrieveLogs(pageNumber) {
        for (let node of document.getElementsByClassName("display-arrow")) {
            node.setAttribute("disabled", true);
        }
        let logData = this.state.logData;
        let columns = this.state.columns;
        let pkColumns = this.state.pkColumns;
        this.setState({
            loadingTable: true,
            logData: undefined,
            columns: undefined,
            pkColumns: undefined
        }, () => {
            this.getTableData("Logs", undefined, undefined, pageNumber - 1, (err, res) => {
                if (err || res.data.results.length <= 0) {
                    this.props.addMessage("Failed to retrieve logs");
                    this.setState({
                        pageNumberInput: this.state.pageNumber,
                        logData,
                        columns,
                        pkColumns,
                        loadingTable: false
                    });
                }
                else {
                    for (let node of document.getElementsByClassName("display-arrow")) {
                        node.removeAttribute("disabled");
                    }
                    if (res.data.results.length > 0) {
                        this.setState({
                            pageNumber,
                            pageNumberInput: pageNumber,
                            logData: res.data.results,
                            columns: res.data.columns,
                            pkColumns: res.data.pkColumns,
                            loadingTable: false
                        });
                    }
                }
            })
        })
    }

    handlePageInputEvent(e) {
        if (e.key === "Enter") {
            this.handleRetrieveLogs(this.state.pageNumberInput)
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
        if (this.props.authenticated) {
            return (
                <div className="logs-page">
                    {this.state.loadingTable && <Loading />}
                    {this.state.logData &&
                        <div className="query-table-container">
                            <table id="query-table" key={this.state.curQueryTable}>
                                <thead id="query-table-header">
                                    {this.state.columns &&
                                    <tr>
                                        {this.state.pkColumns && this.state.pkColumns.map(x => {
                                            return <th key={x}>{x}</th>
                                        })}
                                        {this.state.columns && this.state.columns.map(x => <th key={x} className="query-table-column">{x}</th>)}
                                    </tr>
                                    }
                                </thead>
                                <tbody id="query-table-body">{this.state.logData.map((x, j) => {
                                    return <tr key={j}>{x.map((y, i) => <td key={j + "_" + i} >{y}</td>)}</tr>
                                })}</tbody>
                            </table>
                        </div>
                    }
                    {this.state.logData && this.getPageInputsHTML()}
                </div>
            )
        }
        else {
            return (
                <Loading loadingMessage="Authenticating"/>
            )
        }
    }
}

export default withWrapper(Logs);
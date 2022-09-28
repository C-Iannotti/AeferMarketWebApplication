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
        this.getTableData("Logs", undefined, undefined, pageNumber, (err, res) => {
            if (err) {
                console.error(err);
                this.setState({pageNumberInput: this.state.pageNumber});
            }
            else {
                console.log(res);
                this.setState({
                    pageNumber,
                    logData: res.data.results,
                    columns: res.data.columns,
                    pkColumns: res.data.pkColumns
                });
            }
        })
    }

    handlePageInputEvent(e) {
        console.log(e.key)
        if (e.key === "Enter") {
            this.handleRetrieveLogs()
        }
    }

    render() {
        return (
            <div className="logs-page">
                <input id="page-number-input" onKeyDown={this.handlePageInputEvent} value={this.state.pageNumberInput} onChange={e => this.setState({pageNumberInput: e.target.value})}  type="text" />
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
            </div>
        )
    }
}

export default withWrapper(Logs);
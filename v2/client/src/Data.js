import React from "react"
import { withWrapper } from "./componentWrapper.js"
import {
    renderToString
} from "react-dom/server"
import {
    getTables,
    getTableData
} from "./utils.js"

class Data extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curConstraint: 0,
            curColumn: 0
        };

        this.getTables = getTables.bind(this);
        this.getTableData = getTableData.bind(this);
        this.handleRetrieveData = this.handleRetrieveData.bind(this);
    }

    componentDidMount() {
        this.props.checkLogin((err, res) => {
            if (err) {
                this.props.navigate("/login");
            }
            else {
                this.getTables((err, res) => {
                    if (err) console.error(err);
                    else {
                        let tables = []
                        let tableColumns = {}
                        for (let i = 0; i < res.data.results.length; i++) {
                            tableColumns[res.data.results[i].table] = res.data.results[i].columns
                            tables.push(res.data.results[i].table)
                        }
        
                        this.setState({
                            tables,
                            tableColumns,
                            curTable: tables[0]
                        })
                    }
                });
            }
        });
    }

    handleRetrieveData() {
        let table = document.getElementById("table-input").value
        let pageNumber = document.getElementById("page-number-input").value
        let constraintNodes = document.getElementById("constraints").childNodes
        console.log(constraintNodes)
        let columnNodes = document.getElementById("columns").childNodes
        let constraints = []
        let columns = []

        for (let parentNode of constraintNodes) {
            let values = []
            for (let childNode of parentNode.childNodes) {
                if (childNode.value !== undefined) {
                    values.push(childNode.value)
                }
            }
            constraints.push(values)
        }

        for (let parentNode of columnNodes) {
            let values = []
            for (let childNode of parentNode.childNodes) {
                if (childNode.value !== undefined) {
                    values.push(childNode.value)
                }
            }
            columns.push(values)
        }

        this.getTableData(table, constraints, columns, pageNumber, (err, res) => {
            if (err) console.error(err);
            else {
                console.log(res);
            }
        })
    }

    render() {
        if (this.props.authenticated) {
            return (
                <div className="data-page">
                    <select id="table-input" value={this.state.curTable} onChange={e => {
                        document.getElementById("constraints").innerHTML = ""
                        document.getElementById("columns").innerHTML = ""
                        this.setState({curTable: e.target.value})
                    }}>
                        {this.state.tables && this.state.tables.map(x => {
                            return <option value={x} key={x}>{x}</option>
                        })}
                    </select>
                    <input id="page-number-input" type="text" />
                    <button type="button" onClick={this.handleRetrieveData}>Retrieve Data</button>
                    <div className="query-specifications">
                        <div className="specifications-group">
                            <p>Columns</p>
                            <div onClick={() => {
                                this.setState({curColumn: this.state.curColumn + 1}, () => {
                                    document.getElementById("columns").appendChild((new DOMParser()).parseFromString(renderToString(
                                        <div className="column" id={"column-" + this.state.curColumn}>
                                            <select>
                                                {this.state.tableColumns[this.state.curTable].map(x => {
                                                    return <option value={x} key={x + "_column_" + this.state.curColumn}>{x}</option>
                                                })}
                                            </select>
                                            <select>
                                                <option value="ASC">Ascending</option>
                                                <option value="DESC">Decending</option>
                                            </select>
                                            <div className="delete-button" id={"column-delete-" + this.state.curColumn}>x</div>
                                        </div>
                                    ), "text/html").querySelector("#column-" + this.state.curColumn))
                                    document.getElementById("column-delete-" + this.state.curColumn).onclick = e => {
                                        e.target.parentNode.remove();
                                    };
                                })
                            }}>+</div>
                            <div id="columns" className="columns"></div>
                        </div>
                        <div className="specifications-group">
                            <p>Constraints</p>
                            <div onClick={() => {
                                this.setState({curConstraint: this.state.curConstraint + 1}, () => {
                                    document.getElementById("constraints").appendChild((new DOMParser()).parseFromString(renderToString(
                                        <div className="constraint" id={"constraint-" + this.state.curConstraint}>
                                            <select>
                                                {this.state.tableColumns[this.state.curTable].map(x => {
                                                    return <option value={x} key={x + "_constraint_" + this.state.curConstraint}>{x}</option>
                                                })}
                                            </select>
                                            <select>
                                                <option value="=">=</option>
                                                <option value="<=">&#8804;</option>
                                                <option value=">=">&#8805;</option>
                                            </select>
                                            <input type="text" />
                                            <div className="delete-button" id={"constraint-delete-" + this.state.curConstraint}>x</div>
                                        </div>
                                    ), "text/html").querySelector("#constraint-" + this.state.curConstraint))
                                    document.getElementById("constraint-delete-" + this.state.curConstraint).onclick = e => {
                                        e.target.parentNode.remove();
                                    };
                                })
                            }}>+</div>
                            <div id="constraints" className="constraints"></div>
                        </div>
                    </div>
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

export default withWrapper(Data);
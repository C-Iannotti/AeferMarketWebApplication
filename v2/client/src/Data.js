import React from "react"
import { withWrapper } from "./componentWrapper.js"
import {
    renderToString
} from "react-dom/server"
import {
    getTables
} from "./utils.js"

class Data extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curConstraint: 0,
            curColumn: 0
        };

        this.getTables = getTables.bind(this);
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

                        console.log(tables)
                        console.log(tableColumns)
        
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

    render() {
        if (this.props.authenticated) {
            return (
                <div className="data-page">
                    <select value={this.state.curTable} onChange={e => {
                        document.getElementById("constraints").innerHTML = ""
                        document.getElementById("columns").innerHTML = ""
                        this.setState({curTable: e.target.value})
                    }}>
                        {this.state.tables && this.state.tables.map(x => {
                            return <option value={x} key={x}>{x}</option>
                        })}
                    </select>
                    <div className="constraints-group">
                        <p>Constraints</p>
                        <div onClick={() => {
                            this.setState({curConstraint: this.state.curConstraint + 1}, () => {
                                document.getElementById("constraints").appendChild((new DOMParser()).parseFromString(renderToString(
                                    <div className="constraint" id={"constraint_" + this.state.curConstraint}>
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
                                        <div className="delete-button" id={"constraint-delete-" + this.state.curConstraint}>x</div>
                                    </div>
                                ), "text/html").querySelector("#constraint_" + this.state.curConstraint))
                                document.getElementById("constraint-delete-" + this.state.curConstraint).onclick = e => {
                                    e.target.parentNode.remove();
                                };
                            })
                        }}>+</div>
                        <div id="constraints" className="constraints"></div>
                    </div>
                    <div className="columns-group">
                        <p>Columns</p>
                        <div onClick={() => {
                            this.setState({curColumn: this.state.curColumn + 1}, () => {
                                document.getElementById("columns").appendChild((new DOMParser()).parseFromString(renderToString(
                                    <div className="column" id={"column_" + this.state.curColumn}>
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
                                ), "text/html").querySelector("#column_" + this.state.curColumn))
                                document.getElementById("column-delete-" + this.state.curColumn).onclick = e => {
                                    e.target.parentNode.remove();
                                };
                            })
                        }}>+</div>
                        <div id="columns" className="columns"></div>
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
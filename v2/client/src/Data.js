import React from "react"
import { withWrapper } from "./componentWrapper.js"
import {
    getTables
} from "./utils.js"

class Data extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

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
                    <select value={this.state.curTable} onChange={e => this.setState({curTable: e.target.value})}>
                        {this.state.tables && this.state.tables.map(x => {
                            return <option value={x} key={x}>{x}</option>
                        })}
                    </select>
                    <select>
                        {this.state.curTable && this.state.tableColumns[this.state.curTable].map(x => {
                            return <option value={x} key={x}>{x}</option>
                        })}
                    </select>
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
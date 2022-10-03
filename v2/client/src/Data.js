import React from "react"
import { withWrapper } from "./componentWrapper.js"
import {
    renderToString
} from "react-dom/server"
import {
    getTables,
    getTableData,
    updateSalesData
} from "./utils.js"

class Data extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curQueryTable: 0,
            constraints: [],
            columns: [],
            constraintsInput: [],
            columnsInput: [],
            pageNumber: 0,
            pageNumberInput: 0
        };

        this.getTables = getTables.bind(this);
        this.getTableData = getTableData.bind(this);
        this.updateSalesData = updateSalesData.bind(this);
        this.handleRetrieveData = this.handleRetrieveData.bind(this);
        this.handleRetrieveDataPage = this.handleRetrieveDataPage.bind(this);
        this.handleToggleEdit = this.handleToggleEdit.bind(this);
        this.handleUpdateData = this.handleUpdateData.bind(this);
        this.getPageInputsHTML = this.getPageInputsHTML.bind(this);
        this.handlePageInputEvent = this.handlePageInputEvent.bind(this);
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
                            tableColumns[res.data.results[i].table] =  {
                                columns: res.data.results[i].columns,
                                pkColumns: res.data.results[i].pkColumns
                            }
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
        this.setState({
            pageNumberInput: 0
        }, () => this.handleRetrieveDataPage(0, this.state.curTable, this.state.columnsInput, this.state.constraintsInput))
    }

    handleRetrieveDataPage(page=0, table=undefined, columns=undefined, constraints=undefined) {
        if (table === undefined) {
            table = this.state.curTable;
        }

        if (columns === undefined) {
            columns = this.state.columns;
        }

        if (constraints === undefined) {
            constraints = this.state.constraints;
        }

        this.getTableData(table, constraints, columns, page, (err, res) => {
            if (err) console.error(err);
            else {
                if (res.data.results.length > 0) {
                    this.state.tableColumns[this.state.curTable].pkColumns = res.data.pkColumns
                    this.setState({
                        queryColumns: res.data.columns,
                        queryData: res.data.results,
                        editable: res.data.editable,
                        curQueryTable: this.state.curQueryTable + 1,
                        tableColumns: this.state.tableColumns,
                        pageNumber: page,
                        columns,
                        constraints,
                        columnsInput: [],
                        constraintsInput: []
                    });
                }
            }
        })
    }

    handleToggleEdit(method="edit") {
        if (method === "edit") {
            this.setState({editQuery: true});
        }
        else if (method === "confirm") {
            this.setState({editQuery: false}, this.handleUpdateData);
        }
        else {
            this.setState({editQuery: false}, this.handleRetrieveData);
        }
    }

    handleUpdateData() {
        let tableDataRows = document.getElementById("query-table-body").childNodes;
        let tableDataColumns = document.getElementsByClassName("query-table-column");
        let data = [];
        let pkData = [];
        let columns = [];

        for (let row of tableDataRows) {
            let dataRow = []
            let pkDataRow = []
            for (let i = 0; i < row.childNodes.length; i += 1) {
                if (i < this.state.tableColumns[this.state.curTable].pkColumns.length) {
                    pkDataRow.push(row.childNodes[i].innerText);
                }
                else {
                    dataRow.push(row.childNodes[i].childNodes[0].nodeValue);
                }
            }
            data.push(dataRow)
            pkData.push(pkDataRow)
        }

        for (let node of tableDataColumns) {
            columns.push(node.childNodes[0].nodeValue)
        }
        this.updateSalesData(pkData, data, columns, (err, res) => {
            if (err) console.error(err);
            else {
                this.handleRetrieveDataPage();
            }
        })
    }

    handlePageInputEvent(e) {
        console.log(e.key)
        if (e.key === "Enter") {
            this.handleRetrieveDataPage(this.state.pageNumberInput)
        }
    }

    getPageInputsHTML() {
        return (
            <div className="data-page-inputs">
                <div className="display-arrow" onClick={() => this.handleRetrieveDataPage(this.state.pageNumber - 1)}>&lt;</div>
                <input id="data-number-input" className="page-input" onKeyDown={this.handlePageInputEvent} value={this.state.pageNumberInput} onChange={e => this.setState({pageNumberInput: e.target.value})}  type="text" maxLength={9}/>
                <div className="display-arrow" onClick={() => this.handleRetrieveDataPage(this.state.pageNumber + 1)}>&gt;</div>
            </div>
        )
    }

    render() {
        if (this.props.authenticated) {
            return (
                <div className="data-page">
                    <div className="query-inputs">
                        <div className="query-input-row">
                            <select id="table-input" value={this.state.curTable} onChange={e => {
                                this.setState({curTable: e.target.value, constraintsInput: [], columnsInput: []});
                            }}>
                                {this.state.tables && this.state.tables.map(x => {
                                    return <option value={x} key={x}>{x}</option>
                                })}
                            </select>
                            <button type="button" onClick={() => {
                                this.setState({
                                    columnsInput: [],
                                    constraintsInput: []
                                })
                            }}>Clear Inputs</button>
                        </div>
                        <div className="query-columns-inputs query-input-specification">
                            <div className="query-input-specification-inputs">
                                <select id="column-column-input">
                                    {this.state.tableColumns && [].concat(this.state.tableColumns[this.state.curTable].pkColumns, this.state.tableColumns[this.state.curTable].columns).map(x => {
                                        return <option value={x} key={x + "_column_" + this.state.curColumn}>{x}</option>
                                    })}
                                </select>
                                <select id="column-sort-input">
                                    <option value="ASC">Ascending</option>
                                    <option value="DESC">Decending</option>
                                </select>
                            </div>
                            <div className="add-specification-button" onClick={() => {
                                let column = document.getElementById("column-column-input").value;
                                let columnSort = document.getElementById("column-sort-input").value;
                                this.state.columnsInput.push([column, columnSort]);
                                this.setState({columnsInput: this.state.columnsInput})
                            }}>+</div>
                        </div>
                        <div className="query-constraints-inputs query-input-specification">
                            <div className="query-input-specification-inputs">
                                <select id="constraint-column-input">
                                    {this.state.tableColumns && [].concat(this.state.tableColumns[this.state.curTable].pkColumns, this.state.tableColumns[this.state.curTable].columns).map(x => {
                                        return <option value={x} key={x + "_constraint_" + this.state.curConstraint}>{x}</option>
                                    })}
                                </select>
                                <select id="constraint-comparison-input">
                                    <option value="=">=</option>
                                    <option value="<=">&#8804;</option>
                                    <option value=">=">&#8805;</option>
                                </select>
                                <input type="text" id="constraint-value-input" />
                            </div>
                            <div className="add-specification-button" onClick={() => {
                                let constraintColumn = document.getElementById("constraint-column-input").value;
                                let constraintComparison = document.getElementById("constraint-comparison-input").value;
                                let constraintValue = document.getElementById("constraint-value-input").value;
                                this.state.constraintsInput.push([constraintColumn, constraintComparison, constraintValue]);
                                this.setState({constraintsInput: this.state.constraintsInput})
                            }}>+</div>
                        </div>
                    </div>
                    <div className="query-buttons">
                        <div className="query-table-buttons">
                            <button type="button" onClick={() => {
                                this.setState({
                                    curQueryTable: 0,
                                    queryColumns: undefined,
                                    queryData: undefined,
                                    editable: undefined,
                                    pageNumber: 0,
                                    columns: [],
                                    constraints: []
                                })
                            }}>Clear Table</button>
                            <button type="button" onClick={this.handleRetrieveData}>Retrieve Data</button>
                        </div>
                        {this.state.editable !== undefined &&
                            <div className="query-edit-buttons">
                                {this.state.editable && !this.state.editQuery && <button onClick={() => this.handleToggleEdit()}>Edit</button>}
                                {this.state.editable && this.state.editQuery && <button onClick={() => this.handleToggleEdit("cancel")}>Cancel</button>}
                                {this.state.editable && this.state.editQuery && <button onClick={() => this.handleToggleEdit("confirm")}>Confirm</button>}
                            </div>
                        }
                    </div>
                    <div className="query-specifications">
                        <div id="columns" className="columns">
                            {this.state.columnsInput && this.state.columnsInput.map((x, i) => {
                                return (
                                    <div key={"column_" + i} className="query-specification">
                                        {x.join(' ')}
                                        <div className="query-specification-clear" onClick={() => {
                                            this.state.columnsInput.splice(i, 1);
                                            this.setState({columnsInput: this.state.columnsInput});
                                        }}>x</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div id="constraints" className="constraints">
                            {this.state.constraintsInput && this.state.constraintsInput.map((x, i) => {
                                return (
                                    <div key={"constraint_" + i} className="query-specification">
                                        {x.join(' ')}
                                        <div className="query-specification-clear" onClick={() => {
                                            this.state.constraintsInput.splice(i, 1);
                                            this.setState({constraintsInput: this.state.constraintsInput});
                                        }}>x</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    {this.state.queryData &&
                        <div className="query-table-container">
                            {this.getPageInputsHTML()}
                            <table id="query-table" key={this.state.curQueryTable}>
                                <thead id="query-table-header">
                                    {this.state.tableColumns &&
                                    <tr>
                                        {this.state.queryColumns && this.state.tableColumns[this.state.curTable].pkColumns.map(x => {
                                            return <th key={x}>{x}</th>
                                        })}
                                        {this.state.queryColumns && this.state.queryColumns.map(x => <th key={x} className="query-table-column">{x}</th>)}
                                    </tr>
                                    }
                                </thead>
                                <tbody id="query-table-body">{this.state.queryData.map((x, j) => {
                                    return <tr key={j}>{x.map((y, i) => <td key={j + "_" + i}suppressContentEditableWarning={true} contentEditable={i >= this.state.tableColumns[this.state.curTable].pkColumns.length && this.state.editQuery}>{y}</td>)}</tr>
                                })}</tbody>
                            </table>
                            {this.getPageInputsHTML()}
                        </div>
                    }
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
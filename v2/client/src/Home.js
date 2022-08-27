import React from 'react';
import { withWrapper } from "./componentWrapper.js"
import Chart from "chart.js/auto"
import {
    borderColors,
    backgroundColors
} from "./graphColors.js"
import {
    Pie,
    Bar,
    Line
} from "react-chartjs-2"
import {
    getSalesData,
    getRatingsData,
    getQuantityData,
    getColumnValues,
    getQuantityPerTimeUnit
} from "./utils.js"

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNumber: 1
        };

        this.handleGetSalesData = this.handleGetSalesData.bind(this);
        this.getGraphDisplay = this.getGraphDisplay.bind(this);
        this.getKeyDisplay = this.getKeyDisplay.bind(this);
        this.getSalesData = getSalesData.bind(this);
        this.getRatingsData = getRatingsData.bind(this);
        this.getQuantityData = getQuantityData.bind(this);
        this.getQuantityPerTimeUnit = getQuantityPerTimeUnit.bind(this);
        this.getColumnValues = getColumnValues.bind(this);
    }

    componentDidMount() {
        this.getColumnValues("ProductLine", (err, res) => {
            if (err) console.error(err);
            else {
                let productColors = {};
                for (let i = 0; i < res.data.values.length; i++) {
                    productColors[res.data.values[i]] = {
                        borderColor: borderColors[i],
                        backgroundColor: backgroundColors[i]
                    };
                }
                this.setState({ productLines: res.data.values, productColors});
            }
        });
        this.getColumnValues("branch", (err, res) => {
            if (err) console.error(err);
            else{
                this.setState({ branches: res.data.values });
            }
        });
        this.props.checkLogin((err, res) => {
            if (err) {
                this.props.navigate("/login");
            }
        });
    }

    handleGetSalesData() {
        let branch = document.getElementById("sales-branch-input").value;
        let begDate = document.getElementById("sales-beg-date-input").value;
        let endDate = document.getElementById("sales-end-date-input").value;
        let productLines = Array.from(document.getElementById("sales-product-line-input").selectedOptions).map(({value}) => value);
        let separateOn = document.getElementById("sales-separate-on-input").value;

        this.getColumnValues(separateOn, (err, res) => {
            if (err) console.error(err);
            else {
                this.setState({ separateOnValues: res.data.values });
                let categoryLabels = res.data.values;
                let productLine = productLines.length === 0 ? this.state.productLines : productLines;
                let datasetsLabels = (productLine.length === 1) ? categoryLabels : productLine;
                let newBackgroundColors = [];
                let newBorderColors = [];

                if (productLine.length !== 1) {
                    for (const item of productLine) {
                        newBackgroundColors.push(this.state.productColors[item].backgroundColor)
                        newBorderColors.push(this.state.productColors[item].borderColor)
                    }
                }
                else {
                    for (let i = 0; i < categoryLabels.length; i++) {
                        newBackgroundColors.push(backgroundColors[i]);
                        newBorderColors.push(borderColors[i]);
                    }
                }
                this.getSalesData(branch, begDate, endDate, productLines, separateOn, (err, res) => {
                    if (err) console.error(err);
                    else {
                        let data1 = {};
                        let data2 = {};
                        let data3 = {};
        
                        data1["labels"] = datasetsLabels;
                        data2["labels"] = datasetsLabels;
                        data3["labels"] = productLine;
        
                        let grossIncome = [];
                        let quantity = [];
                        let grossIncomePerCategory = [];
                        let quantityPerCategory = [];
                        if (productLine.length > 1) {
                            for (let i = 0; i < categoryLabels.length; i++) {
                                quantityPerCategory.push([]);
                                grossIncomePerCategory.push([]);
                            }
                        }

                        for (const item of datasetsLabels) {
                            if (productLine.length > 1) {
                                for (let i = 0; i < categoryLabels.length; i++) {
                                    quantityPerCategory[i].push(
                                        res.data[item][categoryLabels[i]] ?
                                        res.data[item][categoryLabels[i]].quantity :
                                        0
                                    );
                                    grossIncomePerCategory[i].push(
                                        res.data[item][categoryLabels[i]] ?
                                        res.data[item][categoryLabels[i]].grossIncome :
                                        0
                                    );
                                }
                            }
                            grossIncome.push((productLine.length > 1) ? res.data[item].totalIncome
                                : (res.data[productLine[0]][item]) ? res.data[productLine[0]][item].grossIncome : 0);
                            quantity.push((productLine.length > 1) ? res.data[item].totalQuantity
                                : (res.data[productLine[0]][item]) ? res.data[productLine[0]][item].quantity : 0);
                        }

                        data1["datasets"] = [{
                            label: "Gross Income",
                            backgroundColor: newBackgroundColors,
                            borderColor: newBorderColors,
                            data: grossIncome,
                            borderWidth: 1
                        }];
                        data2["datasets"] = [{
                            label: "Quantity",
                            backgroundColor: newBackgroundColors,
                            borderColor: newBorderColors,
                            data: quantity,
                            borderWidth: 1
                        }];
                        if (productLine.length > 1) {
                            data3["datasets"] = [];
                            for (let i = 0; i < categoryLabels.length; i++) {
                                data3["datasets"].push({
                                    label: categoryLabels[i],
                                    backgroundColor: backgroundColors[i],
                                    borderColor: borderColors[i],
                                    data: quantityPerCategory[i],
                                    borderWidth: 1
                                });
                            }
                        }
        
                        this.setState({
                            graph1: data1,
                            graph2: data2,
                            graph3: (productLine.length > 1) ? data3 : undefined
                        });
                    }
                });

                this.getRatingsData(branch, begDate, endDate, productLines, separateOn, (err, res) => {
                    if (err) console.error(err);
                    else {
                        let data = {};
                        data["labels"] = [];
                        let datasetsData = []
                        for (let i = 0; i < datasetsLabels.length; i++) {
                            datasetsData.push([])
                        }
                        for (let x = new Date(res.data.begDate), y = new Date(res.data.endDate); x <= y; x.setDate(x.getDate() + 1)) {
                            let temp = x.toISOString().split("T")[0]
                            data["labels"].push(temp)
                            for (let i = 0; i < datasetsLabels.length; i++) {
                                datasetsData[i].push(res.data[datasetsLabels[i]] && res.data[datasetsLabels[i]][temp] ? res.data[datasetsLabels[i]][temp] : null);
                            }
                        }
        
                        data["datasets"] = []
                        for (let i = 0; i < datasetsLabels.length; i++) {
                            data["datasets"].push({
                                label: datasetsLabels[i],
                                backgroundColor: newBackgroundColors[i],
                                borderColor: newBorderColors[i],
                                data: datasetsData[i],
                                borderWidth: 1,
                                spanGaps: true
                            })
                        }
        
                        this.setState({graph4: data})
                    }
                });

                this.getQuantityData(branch, begDate, endDate, productLines, separateOn, (err, res) => {
                    if (err) console.error(err);
                    else {
                        let data = {};
                        data["labels"] = [];
                        let datasetsData = []
                        for (let i = 0; i < datasetsLabels.length; i++) {
                            datasetsData.push([])
                        }
                        for (let x = new Date(res.data.begDate), y = new Date(res.data.endDate); x <= y; x.setDate(x.getDate() + 1)) {
                            let temp = x.toISOString().split("T")[0]
                            data["labels"].push(temp)
                            for (let i = 0; i < datasetsLabels.length; i++) {
                                datasetsData[i].push(res.data[datasetsLabels[i]] && res.data[datasetsLabels[i]][temp] ? res.data[datasetsLabels[i]][temp] : null);
                            }
                        }
        
                        data["datasets"] = []
                        for (let i = 0; i < datasetsLabels.length; i++) {
                            data["datasets"].push({
                                label: datasetsLabels[i],
                                backgroundColor: newBackgroundColors[i],
                                borderColor: newBorderColors[i],
                                data: datasetsData[i],
                                borderWidth: 1,
                                spanGaps: true
                            })
                        }
        
                        this.setState({graph5: data})
                    }
                });

                this.getQuantityPerTimeUnit(branch, begDate, endDate, productLines, separateOn, (err, res) => {
                    if (err) console.error(err);
                    else {
                        let data = {};
                        data["labels"] = [];
                        let datasetsLabels = (productLine.length === 1) ? categoryLabels : productLine;
                        let datasetsData = []
                        for (let i = 0; i < datasetsLabels.length; i++) {
                            datasetsData.push([])
                        }
                        for (let i = res.data["minHour"]; i <= res.data["maxHour"]; i++) {
                            data["labels"].push(i + ":00:00");
                            data["labels"].push(i + ":30:00");
                            for (let j = 0; j < datasetsLabels.length; j++) {
                                datasetsData[j].push(res.data[datasetsLabels[j]] && res.data[datasetsLabels[j]][i + ":00:00"] ? res.data[datasetsLabels[j]][i + ":00:00"] : 0);
                                datasetsData[j].push(res.data[datasetsLabels[j]] && res.data[datasetsLabels[j]][i + ":30:00"] ? res.data[datasetsLabels[j]][i + ":30:00"] : 0);
                            }
                        }

                        data["datasets"] = []
                        for (let i = 0; i < datasetsLabels.length; i++) {
                            data["datasets"].push({
                                label: datasetsLabels[i],
                                backgroundColor: newBackgroundColors[i],
                                borderColor: newBorderColors[i],
                                data: datasetsData[i],
                                borderWidth: 1
                            })
                        }
        
                        this.setState({graph6: data});
                    }
                });
            }
        });
    }

    getKeyDisplay() {
        let separateOnKeys = null;
        if (this.state.separateOnValues) {
            separateOnKeys = []
            for (let i = 0; i < this.state.separateOnValues.length; i++) {
                separateOnKeys.push(
                    <div key={this.state.separateOnValues[i] + "_colorbox"} className="key-object">
                        <div
                            className="color-box"
                            style={{
                                backgroundColor: backgroundColors[i],
                                borderColor: borderColors[i]
                                }}></div>
                        <p>{this.state.separateOnValues[i]}</p>
                    </div>
                )
            }
        }
        return (
            <div className="key-display">
                <div className="color-key">
                    {this.state.productColors && Object.keys(this.state.productColors).map(x => {
                        return (<div key={x + "_colorbox"} className="key-object">
                            <div
                                className="color-box"
                                style={{
                                    backgroundColor: this.state.productColors[x].backgroundColor,
                                    borderColor: this.state.productColors[x].borderColor
                                    }}></div>
                            <p>{x}</p>
                        </div>)
                    })}
                </div>
                <div className="color-key">
                {separateOnKeys}
                </div>
            </div>
        )
    }

    getGraphDisplay() {
        if (this.state.pageNumber === 1) {
            return (
                <div className="graph-display">
                    <div className="sales-graph-group1">
                        {this.state.graph1 &&
                            <div className="graph1">
                                <Pie data={this.state.graph1}
                                    options={{plugins: {legend: false}}}/>
                            </div>
                        }
                        {this.state.graph2 &&
                            <div className="graph1">
                                <Pie data={this.state.graph2}
                                    options={{plugins: {legend: false}}}/>
                            </div>
                        }
                    </div>
                    {this.state.graph3 &&
                        <div className="graph3">
                            <Bar data={this.state.graph3}
                                options={{plugins: {legend: false}}}/>
                        </div>
                    }
                    {this.state.graph6 &&
                        <div className="graph3">
                            <Bar data={this.state.graph6}
                                options={{plugins: {legend: false}}}/>
                        </div>
                    }
                </div>
            )
        }
        else {
            return (
                <div className="graph-display">
                    {this.state.graph4 &&
                        <div className="graph4">
                            <Line data={this.state.graph4}
                                options={{plugins: {legend: false}}}/>
                        </div>
                    }
                    {this.state.graph5 &&
                        <div className="graph4">
                            <Line data={this.state.graph5}
                                options={{plugins: {legend: false}}}/>
                        </div>
                    }
                </div>
            )
        }
    }

    render() {
        if (this.props.authenticated) {
            return (
                <div id="home-page" className="home-page">
                    {this.getKeyDisplay()}
                    <select id="sales-branch-input" name="sales-branch-input">
                        {this.state.branches && this.state.branches.map(x => {
                            return <option key={x[0]} id={x[0]} value={x[0]}>{x[0] + " - " + x[1]}</option>
                        })}
                    </select>
                    <input id="sales-beg-date-input" name="sales-beg-date-input" type="date" />
                    <input id="sales-end-date-input" name="sales-end-date-input" type="date" />
                    <select id="sales-separate-on-input" name="sales-separate-on-input">
                        <option value="gender">Gender</option>
                        <option value="customertype">Customer Type</option>
                    </select>
                    <select id="sales-product-line-input" name="sales-product-line-input" multiple>
                        {this.state.productLines && this.state.productLines.map(x => {
                            return <option key={x} id={x} value={x} onMouseDown={(e) => {
                                e.preventDefault();
                                e.target.selected= !e.target.selected
                                }}>{x}</option>
                        })}
                    </select>
                    <button type="button" onClick={this.handleGetSalesData}>Submit</button>
                    <br />
                    {this.getGraphDisplay()}
                    <br />
                    <div className="graph-display-page-buttons">
                        <button type="button" onClick={() => {this.setState({ pageNumber: 1})}}>Previous</button>
                        <button type="button" onClick={() => {this.setState({ pageNumber: 2})}}>Next</button>
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

export default withWrapper(Home);
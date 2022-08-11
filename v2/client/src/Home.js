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
    getColumnValues
} from "./utils.js"

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleGetSalesData = this.handleGetSalesData.bind(this);
        this.getSalesData = getSalesData.bind(this);
        this.getRatingsData = getRatingsData.bind(this);
        this.getQuantityData = getQuantityData.bind(this);
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
        this.props.checkLogin(this.props.navigate);
    }

    handleGetSalesData() {
        let begDate = document.getElementById("sales-beg-date-input").value;
        let endDate = document.getElementById("sales-end-date-input").value;
        let productLines = Array.from(document.getElementById("sales-product-line-input").selectedOptions).map(({value}) => value);
        let separateOn = document.getElementById("sales-separate-on-input").value;
        this.getColumnValues(separateOn, (err, res) => {
            if (err) console.error(err);
            else {
                let categoryLabels = res.data.values;
                this.getSalesData(begDate, endDate, productLines, separateOn, (err, res) => {
                    if (err) console.error(err);
                    else {
                        let productLine = productLines.length === 0 ? this.state.productLines : productLines;
        
                        let data1 = {}
                        let data2 = {}
                        let data3 = {}
        
                        data1["labels"] = productLine;
                        data2["labels"] = productLine;
                        data3["labels"] = productLine;
        
                        let backgroundColor = []
                        let borderColor = []
                        let grossIncome = []
                        let quantity = []
                        let quantityPerCategory = []
                        for (let i = 0; i < categoryLabels.length; i++) {
                            quantityPerCategory.push([])
                        }
                        for (const item of productLine) {
                            backgroundColor.push(this.state.productColors[item].backgroundColor)
                            borderColor.push(this.state.productColors[item].borderColor)
                            for (let i = 0; i < categoryLabels.length; i++) {
                                quantityPerCategory[i].push(
                                    res.data[item][categoryLabels[i]] ?
                                    res.data[item][categoryLabels[i]].quantity :
                                    0
                                );
                            }
                            grossIncome.push(res.data[item].totalIncome)
                            quantity.push(res.data[item].totalQuantity)
                        }
                        data1["datasets"] = [{
                            label: "Gross Income",
                            backgroundColor,
                            borderColor,
                            data: grossIncome,
                            borderWidth: 1
                        }]
                        data2["datasets"] = [{
                            label: "Quantity",
                            backgroundColor,
                            borderColor,
                            data: quantity,
                            borderWidth: 1
                        }]
        
                        data3["datasets"] = []
                        for (let i = 0; i < categoryLabels.length; i++) {
                            data3["datasets"].push({
                                label: categoryLabels[i],
                                backgroundColor: backgroundColors[i],
                                borderColor: borderColors[i],
                                data: quantityPerCategory[i],
                                borderWidth: 1
                            })
                        }
        
                        this.setState({
                            graph1: data1,
                            graph2: data2,
                            graph3: data3
                        })
                    }
                });

                this.getRatingsData(begDate, endDate, productLines, separateOn, (err, res) => {
                    if (err) console.error(err);
                    else {
                        let productLine = productLines.length === 0 ? this.state.productLines : productLines;
        
                        let data = {};
                        data["labels"] = [];
                        let datasetsLabels = (productLine.length === 1) ? categoryLabels : productLine;
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
                                backgroundColor: backgroundColors[i],
                                borderColor: borderColors[i],
                                data: datasetsData[i],
                                borderWidth: 1,
                                spanGaps: true
                            })
                        }
        
                        this.setState({graph4: data})
                    }
                });

                this.getQuantityData(begDate, endDate, productLines, separateOn, (err, res) => {
                    if (err) console.error(err);
                    else {
                        let productLine = productLines.length === 0 ? this.state.productLines : productLines;
                        let data = {};
                        data["labels"] = [];
                        let datasetsLabels = (productLine.length === 1) ? categoryLabels : productLine;
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
                                backgroundColor: backgroundColors[i],
                                borderColor: borderColors[i],
                                data: datasetsData[i],
                                borderWidth: 1,
                                spanGaps: true
                            })
                        }
        
                        this.setState({graph5: data})
                    }
                });
            }
        });
    }

    render() {
        if (this.props.authenticated) {
            return (
                <div id="home-page" className="home-page">
                    <p>This do be the home page</p>
                    <input id="sales-beg-date-input" name="sales-beg-date-input" type="date" />
                    <input id="sales-end-date-input" name="sales-end-date-input" type="date" />
                    <select id="sales-separate-on-input" name="sales-separate-on-input">
                        <option value="gender">Gender</option>
                        <option value="customertype">Customer Type</option>
                    </select>
                    <select id="sales-product-line-input" name="sales-product-line-input" multiple>
                        {this.state.productLines && this.state.productLines.map(x => {
                            return <option key={x + "_sales"} id={x + "_sales"} value={x} onMouseDown={(e) => {
                                e.preventDefault();
                                e.target.selected= !e.target.selected
                                }}>{x}</option>
                        })}
                    </select>
                    <button type="button" onClick={this.handleGetSalesData}>Submit</button>
                    <br />
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
                    <br />
                    {this.state.graph4 &&
                        <div className="graph4">
                            <Line data={this.state.graph4}
                                options={{plugins: {legend: false}}}/>
                        </div>
                    }
                    <br />
                    <br />
                    {this.state.graph5 &&
                        <div className="graph4">
                            <Line data={this.state.graph5}
                                options={{plugins: {legend: false}}}/>
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

export default withWrapper(Home);
import React from 'react';
import $ from "jquery";
import { withWrapper } from "./componentWrapper.js"
import Chart from "chart.js/auto"
import {
    Pie,
    Bar
} from "react-chartjs-2"
import {
    authenticate,
    getSalesData,
    getRatingsData,
    getQuantityData,
    getProductLines,
    logout
} from "./utils.js"

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.handleGetSalesData = this.handleGetSalesData.bind(this);
        this.handleGetRatingsData = this.handleGetRatingsData.bind(this);
        this.handleGetQuantityData = this.handleGetQuantityData.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.authenticate = authenticate.bind(this);
        this.getSalesData = getSalesData.bind(this);
        this.getRatingsData = getRatingsData.bind(this);
        this.getQuantityData = getQuantityData.bind(this);
        this.getProductLines = getProductLines.bind(this);
        this.logout = logout.bind(this);
    }

    componentDidMount() {
        this.getProductLines();
        this.authenticate(this.props.navigate);
    }

    handleGetSalesData() {
        let begDate = document.getElementById("sales-beg-date-input").value;
        let endDate = document.getElementById("sales-end-date-input").value;
        let productLine = Array.from(document.getElementById("sales-product-line-input").selectedOptions).map(({value}) => value);
        this.getSalesData(begDate, endDate, productLine, (err, res) => {
            if (err) console.error(err);
            else {
                productLine = productLine.length === 0 ? this.state.productLines : productLine;

                let data1 = {}
                let data2 = {}
                let data3 = {}
                let data4 = {}

                data1["labels"] = productLine;
                data2["labels"] = productLine;
                data3["labels"] = productLine;
                data4["labels"] = productLine;

                let backgroundColor = []
                let borderColor = []
                let grossIncome = []
                let quantity = []
                let incomePerItem = []
                for (const item of productLine) {
                    backgroundColor.push(this.state.productColors[item].backgroundColor)
                    borderColor.push(this.state.productColors[item].borderColor)
                    grossIncome.push(res.data[item].totalIncome)
                    quantity.push(res.data[item].totalQuantity)
                    incomePerItem.push(res.data[item].totalIncome / res.data[item].totalQuantity)
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
                data3["datasets"] = [{
                    label: "Gross Income per Item",
                    backgroundColor,
                    borderColor,
                    data: incomePerItem,
                    borderWidth: 1
                }]
                this.setState({
                    graph1: data1,
                    graph2: data2,
                    graph3: data3
                })
            }
        });
    }

    handleGetRatingsData() {
        let begDate = document.getElementById("ratings-beg-date-input").value;
        let endDate = document.getElementById("ratings-end-date-input").value;
        let productLine = document.getElementById("ratings-product-line-input").value;
        this.getRatingsData(begDate, endDate, productLine);
    }

    handleGetQuantityData() {
        let begDate = document.getElementById("quantity-beg-date-input").value;
        let endDate = document.getElementById("quantity-end-date-input").value;
        let productLine = document.getElementById("quantity-product-line-input").value;
        this.getQuantityData(begDate, endDate, productLine);
    }

    handleLogout() {
        this.logout(this.props.navigate);
    }

    render() {
        if (this.state.authenticated) {
            return (
                <div id="home-page" className="home-page">
                    <p>This do be the home page</p>
                    <input id="sales-beg-date-input" name="sales-beg-date-input" type="date" />
                    <input id="sales-end-date-input" name="sales-end-date-input" type="date" />
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
                    <br />
                    <input id="ratings-beg-date-input" name="ratings-beg-date-input" type="date" />
                    <input id="ratings-end-date-input" name="ratings-end-date-input" type="date" />
                    <select id="ratings-product-line-input" name="ratings-product-line-input">
                        <option value="">Default</option>
                        {this.state.productLines && this.state.productLines.map(x => {
                            return <option key={x + "_ratings"} value={x}>{x}</option>
                        })}
                    </select>
                    <button type="button" onClick={this.handleGetRatingsData}>Submit</button>
                    <br />
                    {this.state.ratings && JSON.stringify(this.state.ratings)}
                    <br />
                    <br />
                    <input id="quantity-beg-date-input" name="quantity-beg-date-input" type="date" />
                    <input id="quantity-end-date-input" name="quantity-end-date-input" type="date" />
                    <select id="quantity-product-line-input" name="quantity-product-line-input">
                        <option value="">Default</option>
                        {this.state.productLines && this.state.productLines.map(x => {
                            return <option key={x + "_quantity"} value={x}>{x}</option>
                        })}
                    </select>
                    <button type="button" onClick={this.handleGetQuantityData}>Submit</button>
                    <br />
                    {this.state.quantity && JSON.stringify(this.state.quantity)}
                    <br />
                    <br />
                    <button type="button" id="logout-button" onClick={this.handleLogout}>Logout</button>
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
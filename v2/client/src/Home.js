import React from 'react';
import { withWrapper } from "./componentWrapper.js"
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js"
import {
    Pie
} from "react-chartjs-2"
import {
    authenticate,
    getSalesData,
    getRatingsData,
    getQuantityData,
    getProductLines,
    logout
} from "./utils.js"

ChartJS.register(ArcElement, Tooltip, Legend);

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
        //let productLine = document.getElementById("sales-product-line-input").value;
        this.getSalesData(begDate, endDate);
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
            let data = {}
            if (this.state.sales) {
                data["labels"] = this.state.productLines;
                let backgroundColor = []
                let borderColor = []
                let grossIncome = []
                for (const item of this.state.productLines) {
                    console.log(item)
                    backgroundColor.push(this.state.productColors[item].backgroundColor)
                    borderColor.push(this.state.productColors[item].borderColor)
                    grossIncome.push(this.state.sales[item].Female.grossIncome + this.state.sales[item].Male.grossIncome)
                }
                console.log(this.state.productLines)
                console.log(backgroundColor)
                console.log(borderColor)
                console.log(grossIncome)
                data["datasets"] = [{
                    label: "Gross Income",
                    backgroundColor,
                    borderColor,
                    data: grossIncome,
                    borderWidth: 1
                }]
            }
            console.log(data)
            return (
                <div id="home-page" className="home-page">
                    <p>This do be the home page</p>
                    <input id="sales-beg-date-input" name="sales-beg-date-input" type="date" />
                    <input id="sales-end-date-input" name="sales-end-date-input" type="date" />
                    {/*<select id="sales-product-line-input" name="sales-product-line-input">
                        <option value="">Default</option>
                        {this.state.productLines && this.state.productLines.map(x => {
                            return <option key={x + "_sales"} value={x}>{x}</option>
                        })}
                    </select>*/}
                    <button type="button" onClick={this.handleGetSalesData}>Submit</button>
                    <br />
                    {this.state.sales && 
                        <div>
                            <Pie data={data} />
                            {JSON.stringify(this.state.sales)}
                        </div>}
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
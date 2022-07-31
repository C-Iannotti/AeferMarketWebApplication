import React from 'react';
import axios from "axios";

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.getSalesData = this.getSalesData.bind(this);
        this.handleGetSalesData = this.handleGetSalesData.bind(this);
        this.getRatingsData = this.getRatingsData.bind(this);
        this.handleGetRatingsData = this.handleGetRatingsData.bind(this);
        this.getQuantityData = this.getQuantityData.bind(this);
        this.handleGetQuantityData = this.handleGetQuantityData.bind(this);
    }

    getSalesData(begDate=undefined, endDate=undefined) {
        axios({
            method: "post",
            url: process.env["REACT_APP_SERVER_URL"] + process.env["REACT_APP_SALES_TIMEFRAME_PATH"], 
            data: {
                begDate,
                endDate
            }
        })
        .then(res => {
            console.log(res)
            this.setState({sales: res.data})
        })
        .catch(err => {
            console.error(err)
        });
    }

    handleGetSalesData() {
        let begDate = document.getElementById("sales-beg-date-input").value;
        let endDate = document.getElementById("sales-end-date-input").value;
        this.getSalesData(begDate, endDate);
    }

    getRatingsData(begDate=undefined, endDate=undefined) {
        axios({
            method: "post",
            url: process.env["REACT_APP_SERVER_URL"] + process.env["REACT_APP_RATINGS_TIMEFRAME_PATH"],
            data: {
                begDate,
                endDate
            }
        })
        .then(res => {
            console.log(res)
            this.setState({ratings: res.data})
        })
        .catch(err => {
            console.error(err)
        });
    }

    handleGetRatingsData() {
        let begDate = document.getElementById("ratings-beg-date-input").value;
        let endDate = document.getElementById("ratings-end-date-input").value;
        this.getRatingsData(begDate, endDate);
    }

    getQuantityData(begDate=undefined, endDate=undefined, productLine=undefined) {
        axios({
            method: "post",
            url: process.env["REACT_APP_SERVER_URL"] + process.env["REACT_APP_QUANTITY_TRENDS_PATH"],
            data: {
                begDate,
                endDate,
                productLine
            }
        })
        .then(res => {
            console.log(res)
            this.setState({quantity: res.data})
        })
        .catch(err => {
            console.error(err)
        });
    }

    handleGetQuantityData() {
        let begDate = document.getElementById("quantity-beg-date-input").value;
        let endDate = document.getElementById("quantity-end-date-input").value;
        let productLine = document.getElementById("quantity-product-line-input").value;
        this.getQuantityData(begDate, endDate, productLine);
    }

    render() {
        return (
            <div id="home-page" className="home-page">
                <p>This do be the home page</p>
                <input id="sales-beg-date-input" name="sales-beg-date-input" type="date" />
                <input id="sales-end-date-input" name="sales-end-date-input" type="date" />
                <button type="button" onClick={this.handleGetSalesData}>Submit</button>
                <br />
                {this.state.sales && JSON.stringify(this.state.sales)}
                <br />
                <br />
                <input id="ratings-beg-date-input" name="ratings-beg-date-input" type="date" />
                <input id="ratings-end-date-input" name="ratings-end-date-input" type="date" />
                <button type="button" onClick={this.handleGetRatingsData}>Submit</button>
                <br />
                {this.state.ratings && JSON.stringify(this.state.ratings)}
                <br />
                <br />
                <input id="quantity-beg-date-input" name="quantity-beg-date-input" type="date" />
                <input id="quantity-end-date-input" name="quantity-end-date-input" type="date" />
                <input id="quantity-product-line-input" name="quantity-product-line-input" type="text" />
                <button type="button" onClick={this.handleGetQuantityData}>Submit</button>
                <br />
                {this.state.quantity && JSON.stringify(this.state.quantity)}
            </div>
        )
    }
}

export default Home;
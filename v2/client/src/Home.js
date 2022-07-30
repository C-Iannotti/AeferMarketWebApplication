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
    }

    getSalesData(endDate=undefined, timeframeUnit=undefined) {
        axios({
            method: "post",
            url: process.env["REACT_APP_SERVER_URL"] + process.env["REACT_APP_SALES_TIMEFRAME_PATH"], 
            data: {
                endDate,
                timeframeUnit
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
        let endDate = document.getElementById("end-date-input").value;
        let timeframeUnit = document.getElementById("timeframe-unit-input").value;
        this.getSalesData(endDate, timeframeUnit);
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

    render() {
        return (
            <div id="home-page" className="home-page">
                <p>This do be the home page</p>
                <input id="end-date-input" name="end-date-input" type="date" />
                <select id="timeframe-unit-input" name="timeframe-unit-input" defaultValue="default">
                    <option value="default">30 days</option>
                    <option value="day">1 day</option>
                    <option value="week">1 week</option>
                    <option value="month">1 month</option>
                    <option value="quarter">1 yearly-quarter</option>
                    <option value="year">1 year</option>
                </select>
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
            </div>
        )
    }
}

export default Home;
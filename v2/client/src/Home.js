import React from 'react';
import axios from "axios";

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.getSalesData = this.getSalesData.bind(this);
    }

    getSalesData() {
        console.log(process.env["REACT_APP_SERVER_URL"] + process.env["REACT_APP_SALES_TIMEFRAME_PATH"])
        axios({
            method: "get",
            url: process.env["REACT_APP_SERVER_URL"] + process.env["REACT_APP_SALES_TIMEFRAME_PATH"],
        })
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.error(err)
        })
    }

    render() {
        this.getSalesData();
        return (
            <div id="home-page" className="home-page">
                <p>This do be the home page</p>
            </div>
        )
    }
}

export default Home;
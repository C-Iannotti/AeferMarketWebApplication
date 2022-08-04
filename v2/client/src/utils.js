import axios from "axios";

const SERVER_URL = process.env["REACT_APP_SERVER_URL"];

export function authenticate(navigate) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_AUTHENTICATE_PATH"],
        withCredentials: true
    })
    .then(res => {
        console.log(res)
        this.setState({
            authenticated: res.data.isAuthenticated,
            username: res.data.username
        })
    })
    .catch(err => {
        console.error(err)
        navigate("/login")
    })
};

export function getSalesData(begDate=undefined, endDate=undefined, productLine=undefined) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_SALES_TIMEFRAME_PATH"], 
        data: {
            begDate,
            endDate,
            productLine
        },
        withCredentials: true
    })
    .then(res => {
        console.log(res)
        this.setState({sales: res.data})
    })
    .catch(err => {
        console.error(err)
    });
};

export function getRatingsData(begDate=undefined, endDate=undefined, productLine=undefined) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_RATINGS_TIMEFRAME_PATH"],
        data: {
            begDate,
            endDate,
            productLine
        },
        withCredentials: true
    })
    .then(res => {
        console.log(res)
        this.setState({ratings: res.data})
    })
    .catch(err => {
        console.error(err)
    });
};

export function getQuantityData(begDate=undefined, endDate=undefined, productLine=undefined) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_QUANTITY_TRENDS_PATH"],
        data: {
            begDate,
            endDate,
            productLine
        },
        headers: {
            "Access-Control-Allow-Credentials": true
        },
        withCredentials: true
    })
    .then(res => {
        console.log(res)
        this.setState({quantity: res.data})
    })
    .catch(err => {
        console.error(err)
    });
};

export function getProductLines() {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_PRODUCT_LINES_PATH"]
    })
    .then(res => {
        console.log(res)
        this.setState({ productLines: res.data.productLines})
    })
}
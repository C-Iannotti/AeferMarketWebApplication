import axios from "axios";
import {
    borderColors,
    backgroundColors
} from "./graphColors.js"

const SERVER_URL = process.env["REACT_APP_SERVER_URL"];

export function authenticate(callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_AUTHENTICATE_PATH"],
        withCredentials: true
    })
    .then(res => {
        callback(null, res);
    })
    .catch(err => {
        callback(err);
    });
};

export function getSalesData(begDate=undefined, endDate=undefined, productLine=undefined, separateOn=undefined, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_SALES_TIMEFRAME_PATH"], 
        data: {
            begDate,
            endDate,
            productLine,
            separateOn
        },
        withCredentials: true
    })
    .then(res => {
        callback(null, res)
    })
    .catch(err => {
        callback(err)
    });
};

export function getRatingsData(begDate=undefined, endDate=undefined, productLine=undefined, separateOn=undefined, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_RATINGS_TIMEFRAME_PATH"],
        data: {
            begDate,
            endDate,
            productLine,
            separateOn
        },
        withCredentials: true
    })
    .then(res => {
        callback(null, res);
    })
    .catch(err => {
        callback(err);
    });
};

export function getQuantityData(begDate=undefined, endDate=undefined, productLine=undefined, separateOn=undefined, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_QUANTITY_TRENDS_PATH"],
        data: {
            begDate,
            endDate,
            productLine,
            separateOn
        },
        withCredentials: true
    })
    .then(res => {
        callback(null, res);
    })
    .catch(err => {
        callback(err);
    });
};

export function getColumnValues(column, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_COLUMN_VALUES_PATH"],
        data: {
            column
        }
    })
    .then(res => {
        callback(null, res);
    })
    .catch(err => {
        callback(err);
    });
};

export function login(username, password, callback=()=>{return}) {
    axios({
        method: "post",
        url: process.env["REACT_APP_SERVER_URL"] + process.env["REACT_APP_LOGIN_PATH"],
        data: {
            username,
            password
        },
        withCredentials: true
    })
    .then(res => {
        callback(null, res);
    })
    .catch(err => {
        callback(err);
    });
};

export function logout(callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_LOGOUT_PATH"],
        withCredentials: true
    })
    .then(res => {
        callback(null, res);
    })
    .catch(err => {
        callback(err);
    });
};
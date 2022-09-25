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

export function getSalesData(branch, begDate=undefined, endDate=undefined, productLine=undefined, separateOn=undefined, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_SALES_TIMEFRAME_PATH"], 
        data: {
            begDate,
            endDate,
            productLine,
            separateOn,
            branch
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

export function getRatingsData(branch, begDate=undefined, endDate=undefined, productLine=undefined, separateOn=undefined, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_RATINGS_TIMEFRAME_PATH"],
        data: {
            begDate,
            endDate,
            productLine,
            separateOn,
            branch
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

export function getQuantityData(branch, begDate=undefined, endDate=undefined, productLine=undefined, separateOn=undefined, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_QUANTITY_TRENDS_PATH"],
        data: {
            begDate,
            endDate,
            productLine,
            separateOn,
            branch
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

export function getQuantityPerTimeUnit(branch, begDate=undefined, endDate=undefined, productLine=undefined, separateOn=undefined, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_QUANTITY_PER_TIMEUNIT_PATH"],
        data: {
            begDate,
            endDate,
            productLine,
            separateOn,
            branch
        },
        withCredentials: true
    })
    .then(res => {
        callback(null, res);
    })
    .catch(err => {
        callback(err);
    });
}

export function getPredictedTrends(branch, endDate=undefined, productLine=undefined, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_PREDICT_TRENDS_PATH"],
        data: {
            branch,
            productLine,
            endDate
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

export function appendModelData(callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_MODEL_DATA_PATH"],
        data: {
            dataMethod: "append"
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

export function replaceModelData(callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_MODEL_DATA_PATH"],
        data: {
            dataMethod: "replace"
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

export function incrementModel(callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_MODEL_PATH"],
        data: {
            modelMethod: "increment"
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

export function remakeModel(callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_MODEL_PATH"],
        data: {
            modelMethod: "remake"
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

export function retrieveModel(searchDate, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_MODEL_PATH"],
        data: {
            modelMethod: "retrieval",
            searchDate
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

export function getTables(callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_TABLES_PATH"],
        withCredentials: true
    })
    .then(res => {
        callback(null, res);
    })
    .catch(err => {
        callback(err);
    });
};

export function getTableData(table, constraints, columns, pageNumber, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_TABLE_DATA_PATH"],
        data: {
            table,
            constraints,
            columns,
            pageNumber
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
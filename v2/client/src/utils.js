import axios from "axios";

const SERVER_URL = process.env["REACT_APP_SERVER_URL"];

/*
 * param: callback (callable function)
 * use: makes an API call to see if the user
 *   is authenticated and retrieve current
 *   capabilities
 */
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

/*
 * param: branch (valid character(s))
 * param: begDate (valid date)
 * param: endDate (valid date)
 * param: productLine (string)
 * param: separateOn (string)
 * param: callback (callable function)
 * use: makes an API call to retrieve graph data for
 *   quantity and gross income for each grouping
 *   of product lines (or column values) and a branch
 *   in a range of dates.
 */
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

/*
 * param: branch (valid character(s))
 * param: begDate (valid date)
 * param: endDate (valid date)
 * param: productLine (string)
 * param: separateOn (string)
 * param: callback (callable function)
 * use: makes an API call to retrieve graph data for
 *   average daily rating for each grouping
 *   of product lines (or column values) and a branch
 *   in a range of dates.
 */
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

/*
 * param: branch (valid character(s))
 * param: begDate (valid date)
 * param: endDate (valid date)
 * param: productLine (string)
 * param: separateOn (string)
 * param: callback (callable function)
 * use: makes an API call to retrieve graph data for
 *   daily quantity sold for each grouping
 *   of product lines (or column values) and a branch
 *   in a range of dates.
 */
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

/*
 * param: branch (valid character(s))
 * param: begDate (valid date)
 * param: endDate (valid date)
 * param: productLine (string)
 * param: separateOn (string)
 * param: callback (callable function)
 * use: makes an API call to retrieve graph data for
 *   quantity sold for each open hour for each grouping
 *   of product lines (or column values) and a branch
 *   in a range of dates.
 */
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

/*
 * param: branch (valid character(s))
 * param: endDate (valid date)
 * param: productLine (string)
 * param: callback (callable function)
 * use: makes an API call to retrieve predicted trends for
 *   quantity for each grouping of product lines (or column values)
 *   and a branch in a range of dates.
 */
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

/*
 * param: column (string)
 * param: callback (callable function)
 * use: makes an API call to retrieve the unique
 *   values in a column.
 */
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

/*
 * param: username (string)
 * param: password (string)
 * param: callback (callable function)
 * use: makes an API call to create a session
 *   to the API for a user.
 */
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

/*
 * param: callback (callable function)
 * use: makes an API call to end the current
 *   session between the API and user
 */
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

/*
 * param: callback (callable function)
 * use: makes an API call to update model
 *   data to include days since last update.
 */
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

/*
 * param: callback (callable function)
 * use: makes an API call to recreate model
 *   data.
 */
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

/*
 * param: callback (callable function)
 * use: makes an API call to train the machine
 *   learning model.
 */
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

/*
 * param: callback (callable function)
 * use: makes an API call to make a nwew machine
 *   learning model.
 */
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

/*
 * param: searchDate (date)
 * param: callback (callable function)
 * use: makes an API call to retrieve the closest
 *   machine model created / trained before the
 *   searchDate.
 */
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

/*
 * param: callback (callable function)
 * use: makes an API call to retrieve the
 *   tables and respective primary key columns and
 *   otehr columns from available for access.
 */
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

/*
 * param: table (string)
 * param: constraints (arrau)
 * param: columns (arrau)
 * param: pageNumber (number)
 * param: callback (callable function)
 * use: makes an API call to retrieve the pageNumber
 *   page's data for table matching constraints and ordered
 *   by column.
 */
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

/*
 * param: pkData (array)
 * param: data (array)
 * param: columns (array)
 * param: callback (callable function)
 * use: makes an API call to updated each
 *  item in pkData to have the columns match
 *  data.
 */
export function updateSalesData(pkData, data, columns, callback=()=>{return}) {
    axios({
        method: "post",
        url: SERVER_URL + process.env["REACT_APP_UPDATE_SALES_PATH"],
        data: {
            pkData,
            data,
            columns
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
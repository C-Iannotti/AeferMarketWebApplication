import React, {useState} from 'react';
import { useSwipeable } from "react-swipeable";
import { withWrapper } from "./componentWrapper.js";
import Loading from "./Loading.js"
import Chart from "chart.js/auto";
import {
    borderColors,
    backgroundColors
} from "./graphColors.js";
import {
    Pie,
    Bar,
    Line
} from "react-chartjs-2";
import {
    getSalesData,
    getRatingsData,
    getQuantityData,
    getColumnValues,
    getQuantityPerTimeUnit,
    getPredictedTrends
} from "./utils.js";

function Carousel(props) {
    const [carouselNumber, setCarouselNumber] = useState(0);
    let max = Number(Boolean(props.graph3)) +
            Number(Boolean(props.graph4)) +
            Number(Boolean(props.graph5)) +
            Number(Boolean(props.graph6))

    const handleCarouselChange  = (num) => {

        if (num < 0) num = max - 1
        else num = num % max
        
        if (num >= 0) {
            document.getElementById("graph-carousel-inner").style.transform = "translateX(-" + (100 * num) + "%)"
            setCarouselNumber(num)
            for (let node of document.getElementsByClassName("selected-button")) {
                node.classList.remove("selected-button");
            }
            document.getElementById("graph-display-page-button-background-" + num).classList.add("selected-button");
        }
    }

    let handlers = useSwipeable({
        onSwipedLeft: () => handleCarouselChange(carouselNumber + 1),
        onSwipedRight: () => handleCarouselChange(carouselNumber - 1),
        trackMouse: true
    });

    let buttons = []

    for (let i = 0; i < max; i++) {
        buttons.push(
            <div id={"graph-display-page-button-" + i}
                 className="graph-display-page-button"
                 key={"graph_display_button_" + i}>
                <div id={"graph-display-page-button-background-" + i}
                    className={"graph-display-page-button-background" + (i === 0 ? " selected-button" : "")}
                    onClick={() =>{
                        handleCarouselChange(i);
                    }}></div>
                &#9675;
            </div>
        )
    }

    return (
        <div {...handlers} className="graph-carousel">
            <div id="graph-carousel-inner" className="graph-carousel-inner" style={{transform: "translateX(-0%"}}>
                {props.graph3 &&
                    <div className="graph3 carousel-item">
                        <Bar data={props.graph3}
                            options={{
                                plugins: {legend: false},
                                maintainAspectRatio: false,
                                onResize: (newChart, newSize) => {
                                    if (newSize.width < 856) {
                                        newChart.options.scales.x.ticks.display = false;
                                    }
                                    else {
                                        newChart.options.scales.x.ticks.display = true;
                                    }
                                },
                                scale: {x: {ticks: {display: true}}}
                            }}/>
                    </div>
                }
                {props.graph6 &&
                    <div className="graph3 carousel-item">
                        <Bar data={props.graph6}
                            options={{
                                plugins: {legend: false},
                                maintainAspectRatio: false
                            }}/>
                    </div>
                }
                {props.graph4 &&
                    <div className="graph4 carousel-item">
                        <Line data={props.graph4}
                            options={{
                                plugins: {legend: false},
                                maintainAspectRatio: false
                            }}/>
                    </div>
                }
                {props.graph5 &&
                    <div className="graph4 carousel-item">
                        <Line data={props.graph5}
                            options={{
                                plugins: {legend: false},
                                maintainAspectRatio: false
                            }}/>
                    </div>
                }
            </div>
            <div className="graph-display-page-buttons">
                <div className="display-arrow" onClick={() => handleCarouselChange(carouselNumber - 1)}>&lt;</div>
                {buttons}
                <div className="display-arrow" onClick={() => handleCarouselChange(carouselNumber + 1)}>&gt;</div>
            </div>
        </div>
    )
}

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            carouselNumber: 0
        };

        this.handleGetDisplayData = this.handleGetDisplayData.bind(this);
        this.getGraphDisplay = this.getGraphDisplay.bind(this);
        this.getKeyDisplay = this.getKeyDisplay.bind(this);
        this.getPredictionsDisplay = this.getPredictionsDisplay.bind(this);
        this.getSalesData = getSalesData.bind(this);
        this.getRatingsData = getRatingsData.bind(this);
        this.getQuantityData = getQuantityData.bind(this);
        this.getQuantityPerTimeUnit = getQuantityPerTimeUnit.bind(this);
        this.getColumnValues = getColumnValues.bind(this);
        this.getPredictedTrends = getPredictedTrends.bind(this);
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
        this.getColumnValues("branch", (err, res) => {
            if (err) console.error(err);
            else{
                this.setState({ branches: res.data.values });
            }
        });
        this.props.checkLogin((err, res) => {
            if (err) {
                this.props.navigate("/login");
            }
        });
    }

    handleGetDisplayData() {
        let branch = document.getElementById("sales-branch-input").value;
        let begDate = document.getElementById("sales-beg-date-input").value;
        let endDate = document.getElementById("sales-end-date-input").value;
        let productLines = Array.from(document.getElementById("sales-product-line-input").selectedOptions).map(({value}) => value);
        let separateOn = document.getElementById("sales-separate-on-input").value;

        this.setState({
            loadingGraphs1to3: true,
            loadingGraph4: true,
            loadingGraph5: true,
            loadingGraph6: true,
            loadingPredictions: true,
            graph1: undefined,
            graph2: undefined,
            graph3: undefined,
            graph4: undefined,
            graph5: undefined,
            graph6: undefined,
            predictions: undefined,
            predictionsPL: undefined,
            separateOnValues: undefined
        }, () => {
            this.getColumnValues(separateOn, (err, res) => {
                if (err) {
                    this.setState({
                        errorMessage: "Failed to retrieve columns",
                        loadingGraphs1to3: false,
                        loadingGraph4: false,
                        loadingGraph5: false,
                        loadingGraph6: false,
                        loadingPredictions: false
                    });
                }
                else {
                    this.setState({ separateOnValues: res.data.values });
                    let categoryLabels = res.data.values;
                    let productLine = productLines.length === 0 ? this.state.productLines : productLines;
                    let datasetsLabels = (productLine.length === 1) ? categoryLabels : productLine;
                    let newBackgroundColors = [];
                    let newBorderColors = [];

                    if (productLine.length !== 1) {
                        for (const item of productLine) {
                            newBackgroundColors.push(this.state.productColors[item].backgroundColor)
                            newBorderColors.push(this.state.productColors[item].borderColor)
                        }
                    }
                    else {
                        for (let i = 0; i < categoryLabels.length; i++) {
                            newBackgroundColors.push(backgroundColors[i]);
                            newBorderColors.push(borderColors[i]);
                        }
                    }

                    this.getPredictedTrends(branch, endDate, productLine, (err, res) => {
                        if (err) this.setState({errorMessage2: "Failed to retrieve predictions", loadingPredictions: false});
                        else{
                            this.setState({
                                predictions: res.data.predictions,
                                predictionsPL: res.data.predictionsPL,
                                loadingPredictions: false
                            })
                        }
                    });
                    this.getSalesData(branch, begDate, endDate, productLines, separateOn, (err, res) => {
                        if (err) this.setState({errorMessage: "Failed to retrieve graph(s)", loadingGraphs1to3: false});
                        else {
                            let data1 = {};
                            let data2 = {};
                            let data3 = {};
            
                            data1["labels"] = datasetsLabels;
                            data2["labels"] = datasetsLabels;
                            data3["labels"] = productLine;
            
                            let grossIncome = [];
                            let quantity = [];
                            let grossIncomePerCategory = [];
                            let quantityPerCategory = [];
                            if (productLine.length > 1) {
                                for (let i = 0; i < categoryLabels.length; i++) {
                                    quantityPerCategory.push([]);
                                    grossIncomePerCategory.push([]);
                                }
                            }

                            for (const item of datasetsLabels) {
                                if (productLine.length > 1) {
                                    for (let i = 0; i < categoryLabels.length; i++) {
                                        quantityPerCategory[i].push(
                                            res.data[item][categoryLabels[i]] ?
                                            res.data[item][categoryLabels[i]].quantity :
                                            0
                                        );
                                        grossIncomePerCategory[i].push(
                                            res.data[item][categoryLabels[i]] ?
                                            res.data[item][categoryLabels[i]].grossIncome :
                                            0
                                        );
                                    }
                                }
                                grossIncome.push((productLine.length > 1) ? res.data[item].totalIncome
                                    : (res.data[productLine[0]][item]) ? res.data[productLine[0]][item].grossIncome : 0);
                                quantity.push((productLine.length > 1) ? res.data[item].totalQuantity
                                    : (res.data[productLine[0]][item]) ? res.data[productLine[0]][item].quantity : 0);
                            }

                            data1["datasets"] = [{
                                label: "Gross Income",
                                backgroundColor: newBackgroundColors,
                                borderColor: newBorderColors,
                                data: grossIncome,
                                borderWidth: 1
                            }];
                            data2["datasets"] = [{
                                label: "Quantity",
                                backgroundColor: newBackgroundColors,
                                borderColor: newBorderColors,
                                data: quantity,
                                borderWidth: 1
                            }];
                            if (productLine.length > 1) {
                                data3["datasets"] = [];
                                for (let i = 0; i < categoryLabels.length; i++) {
                                    data3["datasets"].push({
                                        label: categoryLabels[i],
                                        backgroundColor: backgroundColors[i],
                                        borderColor: borderColors[i],
                                        data: quantityPerCategory[i],
                                        borderWidth: 1
                                    });
                                }
                            }
            
                            this.setState({
                                loadingGraphs1to3: false,
                                graph1: data1,
                                graph2: data2,
                                graph3: (productLine.length > 1) ? data3 : undefined
                            });
                        }
                    });

                    this.getRatingsData(branch, begDate, endDate, productLines, separateOn, (err, res) => {
                        if (err) this.setState({errorMessage: "Failed to retrieve graph(s)", loadingGraph4: false});
                        else {
                            let data = {};
                            data["labels"] = [];
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
                                    backgroundColor: newBackgroundColors[i],
                                    borderColor: newBorderColors[i],
                                    data: datasetsData[i],
                                    borderWidth: 1,
                                    spanGaps: true
                                })
                            }
            
                            this.setState({loadingGraph4: false, graph4: data})
                        }
                    });

                    this.getQuantityData(branch, begDate, endDate, productLines, separateOn, (err, res) => {
                        if (err) this.setState({errorMessage: "Failed to retrieve graph(s)", loadingGraph5: false});
                        else {
                            let data = {};
                            data["labels"] = [];
                            let datasetsData = []
                            for (let i = 0; i < datasetsLabels.length; i++) {
                                datasetsData.push([])
                            }
                            for (let x = new Date(res.data.begDate), y = new Date(res.data.endDate); x <= y; x.setDate(x.getDate() + 1)) {
                                let temp = x.toISOString().split("T")[0]
                                data["labels"].push(temp)
                                for (let i = 0; i < datasetsLabels.length; i++) {
                                    datasetsData[i].push(res.data[datasetsLabels[i]] && res.data[datasetsLabels[i]][temp] ? res.data[datasetsLabels[i]][temp] : 0);
                                }
                            }
            
                            data["datasets"] = []
                            for (let i = 0; i < datasetsLabels.length; i++) {
                                data["datasets"].push({
                                    label: datasetsLabels[i],
                                    backgroundColor: newBackgroundColors[i],
                                    borderColor: newBorderColors[i],
                                    data: datasetsData[i],
                                    borderWidth: 1,
                                    spanGaps: true
                                })
                            }
            
                            this.setState({loadingGraph5: false, graph5: data})
                        }
                    });

                    this.getQuantityPerTimeUnit(branch, begDate, endDate, productLines, separateOn, (err, res) => {
                        if (err) this.setState({errorMessage: "Failed to retrieve graph(s)", loadingGraph6: false});
                        else {
                            let data = {};
                            data["labels"] = [];
                            let datasetsLabels = (productLine.length === 1) ? categoryLabels : productLine;
                            let datasetsData = []
                            for (let i = 0; i < datasetsLabels.length; i++) {
                                datasetsData.push([])
                            }
                            for (let i = res.data["minHour"]; i <= res.data["maxHour"]; i++) {
                                data["labels"].push(i + ":00:00");
                                for (let j = 0; j < datasetsLabels.length; j++) {
                                    datasetsData[j].push(res.data[datasetsLabels[j]] && res.data[datasetsLabels[j]][i] ? res.data[datasetsLabels[j]][i] : 0);
                                }
                            }

                            data["datasets"] = []
                            for (let i = 0; i < datasetsLabels.length; i++) {
                                data["datasets"].push({
                                    label: datasetsLabels[i],
                                    backgroundColor: newBackgroundColors[i],
                                    borderColor: newBorderColors[i],
                                    data: datasetsData[i],
                                    borderWidth: 1
                                })
                            }
            
                            this.setState({loadingGraph6: false, graph6: data});
                        }
                    });
                }
            })
        })
    }

    getKeyDisplay() {
        let separateOnKeys = null;
        if (this.state.separateOnValues) {
            separateOnKeys = []
            for (let i = 0; i < this.state.separateOnValues.length; i++) {
                separateOnKeys.push(
                    <div key={this.state.separateOnValues[i] + "_colorbox"} className="key-object">
                        <div
                            className="color-box"
                            style={{
                                backgroundColor: backgroundColors[i],
                                borderColor: borderColors[i]
                                }}></div>
                        <p>{this.state.separateOnValues[i]}</p>
                    </div>
                )
            }
        }
        return (
            <div className="key-display">
                <div className="color-key">
                    {this.state.productColors && Object.keys(this.state.productColors).map(x => {
                        return (<div key={x + "_colorbox"} className="key-object">
                            <div
                                className="color-box"
                                style={{
                                    backgroundColor: this.state.productColors[x].backgroundColor,
                                    borderColor: this.state.productColors[x].borderColor
                                    }}></div>
                            <p>{x}</p>
                        </div>)
                    })}
                </div>
                <div className="color-key">
                {separateOnKeys}
                </div>
            </div>
        )
    }

    getGraphDisplay() {
        return  (
            <div className="graph-display">
                <div className="sales-graph-group1">
                    {this.state.graph1 &&
                        <div className="graph1">
                            <Pie data={this.state.graph1}
                                options={{
                                    plugins: {legend: false},
                                    maintainAspectRatio: false
                                }}/>
                        </div>
                    }
                    {this.state.graph2 &&
                        <div className="graph1">
                            <Pie data={this.state.graph2}
                                options={{
                                    plugins: {legend: false},
                                    maintainAspectRatio: false
                                }}/>
                        </div>
                    }
                </div>
                {(this.state.graph3 || this.state.graph4 || this.state.graph5 || this.state.graph6) &&
                    <Carousel graph3={this.state.graph3} graph4={this.state.graph4} graph5={this.state.graph5} graph6={this.state.graph6} />
                }
            </div>
        )
    }

    getPredictionsDisplay() {
        let predictionHTML = []
        for (let i = 0; i < this.state.predictions.length; i++) {
            let predictionDirection = "~"
            let predictionClass = "predict-same"
            if (this.state.predictions[i] === 2) {
                predictionDirection = "ᐃ"
                predictionClass = "predict-up"
            }
            else if (this.state.predictions[i] === 0) {
                predictionDirection = "ᐁ"
                predictionClass = "predict-down"
            }
            predictionHTML.push(
                <div className={"product-line-prediction " + predictionClass} key={this.state.predictionsPL[i] + "_prediction"}>
                    {this.state.predictionsPL[i]} {predictionDirection}
                </div>
            )
        }

        return (
            <div className="product-line-predictions">
                {predictionHTML}
            </div>
        )
    }

    render() {
        if (this.props.authenticated) {
            return (
                <div id="home-page" className="home-page">
                    {this.getKeyDisplay()}
                    <div className="sales-query-inputs">
                        <div className="sales-select-inputs">
                            <select id="sales-branch-input" name="sales-branch-input">
                                {this.state.branches && this.state.branches.map(x => {
                                    return <option key={x[0]} id={x[0]} value={x[0]}>{x[0] + " - " + x[1]}</option>
                                })}
                            </select>
                            <select id="sales-separate-on-input" name="sales-separate-on-input">
                                <option value="gender">Gender</option>
                                <option value="customertype">Customer Type</option>
                            </select>
                        </div>
                        <div className="sales-date-inputs">
                            <div className="sales-date-input">
                                From 
                                <input id="sales-beg-date-input" name="sales-beg-date-input" type="date" />
                            </div>
                            <div className="sales-date-input">
                                To
                                <input id="sales-end-date-input" name="sales-end-date-input" type="date" />
                            </div>
                        </div>
                        <select id="sales-product-line-input" name="sales-product-line-input" size="3" multiple>
                            {this.state.productLines && this.state.productLines.map(x => {
                                return <option key={x} id={x} value={x} onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.target.selected= !e.target.selected
                                    }}>{x}</option>
                            })}
                        </select>
                    </div>
                    <button type="button" onClick={this.handleGetDisplayData}>Submit</button>
                    {this.state.predictions && this.getPredictionsDisplay()}
                    {this.getGraphDisplay()}
                    {(this.state.loadingGraphs1to3 ||
                      this.state.loadingGraph4 || 
                      this.state.loadingGraph5 || 
                      this.state.loadingGraph6 || 
                      this.state.loadingPredictions) && <Loading />}
                    {this.state.errorMessage && <p className="error-message">{this.state.errorMessage}</p>}
                    {this.state.errorMessage2 && <p className="error-message">{this.state.errorMessage2}</p>}
                </div>
            )
        }
        else {
            return (
                <Loading loadingMessage="Authenticating"/>
            )
        }
    }
}

export default withWrapper(Home);
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from "./Home.js";
import Login from "./Login.js";
import Header from "./Header.js";
import Data from "./Data.js";
import Logs from "./Logs.js";
import Model from "./Model.js";
import { 
  BrowserRouter,
  Routes,
  Route } from "react-router-dom";
import {
  authenticate
} from "./utils.js"

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentMessages: ["Example message"]
    }

    this.setLogoutState = this.setLogoutState.bind(this);
    this.checkLogin = this.checkLogin.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.authenticate = authenticate.bind(this);
  }

  componentDidMount() {
    this.checkLogin();
  }

  checkLogin(callback=()=>{return}) {
    this.authenticate((err, res) => {
      if (err) {
        this.setState({
          username: undefined,
          authenticated: false
        }, () => callback(err));
      }
      else {
        this.setState({
          authenticated: res.data.isAuthenticated,
          username: res.data.username,
          dataAccess: res.data.dataAccess,
          modelAccess: res.data.modelAccess,
          logsAccess: res.data.logsAccess
        }, () => callback(null, res));
      }
    });
  }

  addMessage(message) {
    this.setState({
        currentMessages: this.state.currentMessages.concat([message])
    })
  }

  runFunctionAcrossApp(func) {
    func();
  }

  getMessageDisplayHTML() {
      return (
          <div className={"message-container " + ((this.state.currentMessages.length > 0) ? "slide-in" : "slide-out")}>
              <div className="total-messages"
                  onMouseEnter={() => this.setState({ isHoveredTotalMessages: true })}
                  onMouseLeave={() => this.setState({ isHoveredTotalMessages: false })}
                  onClick={() => this.setState({ currentMessages: [], isHoveredTotalMessages: false })}
                  >{this.state.isHoveredTotalMessages ? "X" : this.state.currentMessages.length}</div>
              <div className="current-message">
                  <p>{this.state.currentMessages[0]}</p>
                  <button type="button"
                      id="message-clear-button"
                      className="message-clear-button"
                      onClick={() => this.setState({ currentMessages: this.state.currentMessages.slice(1) })}
                      >X</button>
              </div>
          </div>
      )
  }

  setLogoutState() {
    this.setState({
      username: undefined,
      authenticated: false,
      dataAccess: undefined,
      modelAccess: undefined,
      logsAccess: undefined
    });
  }

  render() {
    return (
      <BrowserRouter>
        <div className="app">
          {this.state.authenticated &&
            <Header username={this.state.username}
              setLogoutState={this.setLogoutState}
              dataAccess={this.state.dataAccess}
              modelAccess={this.state.modelAccess}
              logsAccess={this.state.logsAccess}/>}
          <Routes>
            <Route path="/" element={<Home addMessage={this.addMessage} checkLogin={this.checkLogin} authenticated={this.state.authenticated} />} />
            <Route path="/login" element={<Login addMessage={this.addMessage} checkLogin={this.checkLogin} authenticated={this.state.authenticated} />} />
            <Route path="/data" element={<Data addMessage={this.addMessage} checkLogin={this.checkLogin} authenticated={this.state.authenticated} />} />
            <Route path="/logs" element={<Logs addMessage={this.addMessage} checkLogin={this.checkLogin} authenticated={this.state.authenticated} />} />
            <Route path="/model" element={<Model runFunctionAcrossApp={this.runFunctionAcrossApp} addMessage={this.addMessage} checkLogin={this.checkLogin} authenticated={this.state.authenticated} />} />
            <Route path="*" element={<p>Unable to find Route!</p>}/>
          </Routes>
          {this.getMessageDisplayHTML()}
        </div>
      </BrowserRouter>
    )
  }
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

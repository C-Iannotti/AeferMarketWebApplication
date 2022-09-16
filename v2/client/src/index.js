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
    this.state = {}

    this.setLogoutState = this.setLogoutState.bind(this);
    this.checkLogin = this.checkLogin.bind(this);
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
          username: res.data.username
        }, () => callback(null, res));
      }
    });
  }

  setLogoutState() {
    this.setState({
      username: undefined,
      authenticated: false
    });
  }

  render() {
    return (
      <BrowserRouter>
        {this.state.authenticated && <Header username={this.state.username} setLogoutState={this.setLogoutState} />}
        <Routes>
          <Route path="/" element={<Home checkLogin={this.checkLogin} authenticated={this.state.authenticated} />} />
          <Route path="/login" element={<Login checkLogin={this.checkLogin} authenticated={this.state.authenticated} />} />
          <Route path="/data" element={<Data checkLogin={this.checkLogin} authenticated={this.state.authenticated} />} />
          <Route path="/logs" element={<Logs checkLogin={this.checkLogin} authenticated={this.state.authenticated} />} />
          <Route path="/model" element={<Model checkLogin={this.checkLogin} authenticated={this.state.authenticated} />} />
          <Route path="*" element={<p>Unable to find Route!</p>}/>
        </Routes>
      </BrowserRouter>
    )
  }
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

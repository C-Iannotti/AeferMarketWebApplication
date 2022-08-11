import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from "./Home.js";
import Login from "./Login.js"
import Header from "./Header.js"
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

  checkLogin(navigate=undefined) {
    this.authenticate((err, res) => {
      if (err) {
        this.setState({
          username: undefined,
          authenticated: false
        });
        if(navigate) navigate("/login");
      }
      else {
        this.setState({
          authenticated: res.data.isAuthenticated,
          username: res.data.username
        });
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
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<p>Unable to find Route!</p>}/>
        </Routes>
      </BrowserRouter>
    )
  }
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

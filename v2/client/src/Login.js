import React from "react"
import axios from "axios"
import { withWrapper } from "./componentWrapper.js"

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.login = this.login.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
    }

    login(username, password) {
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
            console.log(res);
            this.props.navigate("/")
        })
        .catch(err => {
            console.error(err);
        })
    }

    handleLogin() {
        let username = document.getElementById("username-input").value;
        let password = document.getElementById("password-input").value;
        this.login(username, password);
    }

    render() {
        return (
            <div id="login-page">
                <input type="text" id="username-input" placeholder="Username"/>
                <input type="password" id="password-input" placeholder="Password" />
                <button type="button" onClick={this.handleLogin}>Submit</button>
            </div>
        )
    }
}

export default withWrapper(Login);
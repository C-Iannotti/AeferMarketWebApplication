import React from "react"
import { withWrapper } from "./componentWrapper.js"
import {
    login
} from "./utils.js"

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.login = login.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
    }

    handleLogin() {
        let username = document.getElementById("username-input").value;
        let password = document.getElementById("password-input").value;
        this.login(username, password, this.props.navigate);
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
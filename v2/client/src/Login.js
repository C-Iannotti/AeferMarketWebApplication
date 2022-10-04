import React from "react"
import { withWrapper } from "./componentWrapper.js"
import Loading from "./Loading.js"
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

    componentDidMount() {
        this.props.checkLogin((err, res) => {
            if (err === null) {
                this.props.navigate("/");
            }
        });
    }

    handleLogin() {
        let username = document.getElementById("username-input").value;
        let password = document.getElementById("password-input").value;
        this.login(username, password, (err, res) => {
            if (err) console.error(err);
            else {
                this.props.checkLogin((err, res) => {
                    if (err) console.error(err);
                    else {
                        this.props.navigate("/");
                    }
                })
            }
        });
    }

    render() {
        if (this.props.authenticated === false) {
            return (
                <div id="login-page">
                    <input type="text" id="username-input" placeholder="Username"/>
                    <input type="password" id="password-input" placeholder="Password" />
                    <button type="button" onClick={this.handleLogin}>Submit</button>
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

export default withWrapper(Login);
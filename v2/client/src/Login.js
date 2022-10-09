import React from "react"
import { withWrapper } from "./componentWrapper.js"
import Loading from "./Loading.js"
import {
    login
} from "./utils.js"

/*
 * A React component for displaying the login UI
 */
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
            if (err) {
                if (err.response.status === 401) this.props.addMessage("Invalid username/password");
                else this.props.addMessage("Failed to login");
            }
            else {
                this.props.checkLogin((err, res) => {
                    if (err) this.props.addMessage("Failed to login");
                    else {
                        this.props.navigate("/");
                    }
                });
            }
        });
    }

    render() {
        if (this.props.authenticated === false) {
            return (
                <div id="login-page" className="login-page">
                    <div className="login-page-inputs">
                        <input type="text" id="username-input" placeholder="Username"/>
                        <input type="password" id="password-input" placeholder="Password" />
                    </div>
                    <button className="login-button" type="button" onClick={this.handleLogin}>Sign in</button>
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
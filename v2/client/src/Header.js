import React from "react"
import { withWrapper } from "./componentWrapper.js"
import {
    logout
} from "./utils.js"

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleLogout = this.handleLogout.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.logout = logout.bind(this);
    }

    handleLogout() {
        this.logout((err, res) => {
            if (err) console.error(err);
            else {
                this.props.setLogoutState();
                this.props.navigate("/login");
            }
        });
    }

    handlePageChange(page) {
        this.props.navigate(page)
    }

    render() {
        return (
            <div className="header">
                <p>{this.props.username}</p>
                <button type="button" id="home-button" onClick={() => this.handlePageChange("/")}>Home</button>
                <button type="button" id="model-button" onClick={() => this.handlePageChange("/model")}>Model</button>
                <button type="button" id="data-button" onClick={() => this.handlePageChange("/data")}>Data</button>
                <button type="button" id="logs-button" onClick={() => this.handlePageChange("/logs")}>Logs</button>
                <button type="button" id="logout-button" onClick={this.handleLogout}>Logout</button>
            </div>
        )
    }
}

export default withWrapper(Header);
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
            if (err) this.props.addMessage("Failed to logout");
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
                <div className="header-buttons">
                    <div id="home-button" className="header-button" onClick={() => this.handlePageChange("/")}>Home</div>
                    {this.props.modelAccess && <div id="model-button" className="header-button" onClick={() => this.handlePageChange("/model")}>Model</div>}
                    {this.props.dataAccess && <div id="data-button" className="header-button" onClick={() => this.handlePageChange("/data")}>Data</div>}
                    {this.props.logsAccess && <div id="logs-button" className="header-button" onClick={() => this.handlePageChange("/logs")}>Logs</div>}
                </div>
                <div id="header-username" className="header-username" onClick={this.handleLogout}>{this.props.username}</div>
            </div>
        )
    }
}

export default withWrapper(Header);
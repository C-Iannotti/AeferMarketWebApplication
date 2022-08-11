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

    render() {
        return (
            <div className="header">
                <p>{this.props.username}</p>
                <button type="button" id="logout-button" onClick={this.handleLogout}>Logout</button>
            </div>
        )
    }
}

export default withWrapper(Header);
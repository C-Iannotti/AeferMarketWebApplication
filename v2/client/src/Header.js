import React from "react"
import { withWrapper } from "./componentWrapper.js"
import {
    logout
} from "./utils.js"

/*
 * A React component that displays the header across the website
 * for logging in and manuevering around the website.
 */
class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleLogout = this.handleLogout.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.logout = logout.bind(this);
    }

    componentDidMount() {
        window.addEventListener("click", this.handleClick);
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.handleClick);
    }

    handleClick(e) {
        if (e.target.matches(".logout-dropdown-button")) {
            this.setState({
                hasDropdown: !this.state.hasDropdown
            }, () => document.getElementById("logout-dropdown").classList.toggle("logout-dropdown-display"));
        }
        else if (!document.getElementById("logout-dropdown").contains(e.target) && !document.getElementById("logout-dropdown").classList.contains("logout-dropdown-display")) {
            this.setState({
                hasDropdown: false
            }, () => document.getElementById("logout-dropdown").classList.toggle("logout-dropdown-display"));
        }
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
        this.props.navigate(page);
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
                <div className="header-user-container">
                <div id="header-username" className="header-username" onClick={this.handleLogout}>{this.props.username}</div>
                    <div>
                        <button type="button"
                                className="logout-dropdown-button">{this.state.hasDropdown ? <>&and;</> : <>&or;</>}</button>
                        <div className="logout-dropdown-parent">
                            <div id="logout-dropdown" className="logout-dropdown logout-dropdown-display">
                                {<button type="button"
                                    id="logout-button"
                                    className="logout-button"
                                    onClick={() => this.handleLogout()}
                                    >Logout</button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withWrapper(Header);
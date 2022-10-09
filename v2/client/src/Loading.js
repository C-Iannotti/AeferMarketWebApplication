import React from "react";

/* 
 * A React component for displaying a loading visual
 */
export default class Loading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return(
            <div className="loading-component">
                <p className="loading-message">{this.props.loadingMessage || ""}</p>
                <div className="dot-flashing dot-flashing-loading"></div>
            </div>
        )
    }
}
import React, { Component } from 'react';

class Popup extends Component {
    render() {
        return (
            <div className="popup-background">
                <div className="popup">
                    <input
                        style={{
                            color: this.props.users[this.props.id].color
                        }}
                        placeholder="Enter a nickname"
                        type="text"
                        className="popup-input"
                    />
                </div>
            </div>
        );
    }
}

export default Popup;

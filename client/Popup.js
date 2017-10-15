import React, { Component } from 'react';
import config from '../config';

class Popup extends Component {
    handleSubmit(event) {
        if (event.key === 'Enter') {
            const value = this.input.value;
            if (value.length > config.GAME.NICKNAME_MIN_LEN) {
                this.props.socket.emit('nickname', this.input.value);
                this.props.close();
            }
        }
    }

    getInputRef(e) {
        if (e) {
            this.input = e;
        }
    }

    render() {
        return (
            <div className="popup-background">
                <div
                    className="popup-color"
                >
                    <div className="popup-color-text">This is your color: </div>
                    <div
                        className="popup-your-color"
                        style={{
                            background: this.props.color
                        }}
                    />
                </div>

                <input
                    ref={this.getInputRef.bind(this)}
                    onKeyPress={this.handleSubmit.bind(this)}
                    style={{
                        color: this.props.color
                    }}
                    placeholder="Enter a nickname"
                    type="text"
                    className="popup-input"
                    maxLength={config.GAME.NICKNAME_MAX_LEN}
                />
                <div
                    className="popup-decline"
                    onClick={this.props.close}
                >
                    I want to be anonymous
                </div>
            </div>
        );
    }
}

export default Popup;

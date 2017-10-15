import React, { Component } from 'react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import config from '../config';

class UsersBox extends Component {
    bindInputEvents(e) {
        // store reference to input element
        if (e) {
            this.textInput = e;
            e.addEventListener('keydown', this.handleEnterEvent.bind(this));
        }
    }

    handleEnterEvent(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    sendMessage() {
        if (this.textInput.value !== '') {
            this.props.socket.emit('chat', this.textInput.value);
            this.textInput.value = '';
        }
    }

    getScrollbarRef(e) {
        if (e) {
            this.scrollbar = e;
            e.scrollToBottom();
        }
    }

    render() {
        const users = Object.values(this.props.users).filter(user => user.connected);

        return (
            <div className="users-box">
                <div className="users-box-header">
                    <span> {`${users.length} user${users.length === 1 ? '' : 's'} online`}</span>
                </div>
                <div className="users-list-box">
                    <Scrollbars
                        autohide
                        autoHideTimeout={1000}
                        autoHideDuration={200}
                    >
                        <div className="users-list">
                            {users.map((user, i) => (
                                <div
                                    key={i}
                                    style={{
                                        color: user.color
                                    }}
                                >
                                    {user.nick}
                                </div>))}
                        </div>
                    </Scrollbars>
                </div>
                <div className="chat-box">
                    <Scrollbars
                        ref={this.getScrollbarRef.bind(this)}
                        style={{
                            flex: 1
                        }}
                        autohide
                        autoHideTimeout={1000}
                        autoHideDuration={200}
                    >
                        <div className="chat">
                            {this.props.chat.map(event => (
                                <p className="chat-message">
                                    <span className="chat-stamp">{moment.unix(event.stamp).format('h:mm')}</span>
                                    <span
                                        className="chat-nick"
                                        style={{ color: this.props.users[event.id].color }}
                                    >
                                        {`${this.props.users[event.id].nick}: `}
                                    </span>
                                    {event.content}
                                </p>
                            ))}
                        </div>
                    </Scrollbars>
                </div>
                <div className="users-chat-box">
                    <input
                        placeholder="Type a message..."
                        type="text"
                        maxLength={config.CHAT.MESSAGE_MAX_LEN}
                        className="users-chat-input"
                        autoFocus
                        ref={this.bindInputEvents.bind(this)}
                    >
                    </input>
                    <div className="chat-send-button" onClick={this.sendMessage.bind(this)}>Send</div>
                </div>
            </div>
        );
    }
}

export default UsersBox;

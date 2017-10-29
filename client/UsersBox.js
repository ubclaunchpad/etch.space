import React, { Component } from 'react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import config from '../config';

class UsersBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            scrolledToBottom: true
        };
    }

    componentDidMount() {
        this.scrollbar.scrollToBottom();
    }

    componentDidUpdate(prevProps) {
        if (this.scrollbar && this.state.scrolledToBottom) {
            this.scrollbar.scrollToBottom();
        }
    }

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
        }
    }

    handleScroll(values) {
        if (values.top === 1) {
            this.setState({
                scrolledToBottom: true
            });
        } else {
            this.setState({
                scrolledToBottom: false
            });
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
                        onScrollFrame={this.handleScroll.bind(this)}
                        ref={this.getScrollbarRef.bind(this)}
                        style={{
                            flex: 1
                        }}
                        autohide
                        autoHideTimeout={1000}
                        autoHideDuration={200}
                    >
                        <div className="chat">
                            {this.props.chat.map((event, i) => (
                                <p
                                    className="chat-message"
                                    key={i}
                                >
                                    <span className="chat-stamp">{moment.unix(event.stamp).format('h:mm')}</span>
                                    <span
                                        className="chat-nick"
                                        style={{ color: event.color }}
                                    >
                                        {`${event.nick}: `}
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

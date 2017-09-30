import React, { Component } from 'react';
import moment from 'moment';

class UsersBox extends Component {

    componentDidMount() {
    }

    bindInputEvents(e) {

        // store reference to input element
        if (e) {
            this.textInput = e;
            e.addEventListener('keydown', this.handleEnterEvent.bind(this));
        }

    }

    handleEnterEvent(event) {
        if (event.key === "Enter") {
            if (this.textInput.value !== "") {
                this.props.socket.emit('chat', this.textInput.value);
                this.textInput.value = "";    
            }
        }
    }

    scrollChatToBottom(e) {
        if (e) {
            e.scrollTop = e.scrollHeight;
        }
    }

    render() {

        const users = Object.values(this.props.users).filter(user => user.connected);

        return (
            <div className="users-box">
                <div className="users-box-header">
                    {`${users.length} user(s) online`}
                </div>
                <div className="users-list">
                {users.map((user, i) => {
                    return (
                        <div
                            key={i}
                            style={{
                                color: user.color
                            }}
                        >
                            {user.nick}
                        </div>)
                    })}
  
                </div>    
                <div
                    className="chat"
                    ref={this.scrollChatToBottom}
                >
                        {this.props.chat.map(event => {
                        return (
                            <p className="chat-message">
                                <span className="chat-stamp">{moment.unix(event.stamp).format('h:mm')}</span>
                                <span
                                    className="chat-nick"
                                    style={{color: this.props.users[event.id].color}}
                                >
                                    {this.props.users[event.id].nick + ': '}
                                </span>
                                {event.content}
                            </p>
                        ) 
                })}
                </div>  
                <div className="users-chat-box">
                <div>me:</div>
                <input
                    type="text"    
                    className="users-chat-input"
                    autoFocus
                    ref={this.bindInputEvents.bind(this)}    
                >
                    </input>
                </div>    
            </div>
        )
    }

}

export default UsersBox;
import React, { Component } from 'react';

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

    render() {

        const userIds = Object.keys(this.props.users); 

        return (
            <div className="users-box">
                <div className="users-box-header">
                    {`${userIds.length} user(s) online`}
                </div>
                <div className="users-list">
                {userIds.map((id, i) => {
                    const user = this.props.users[id];
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
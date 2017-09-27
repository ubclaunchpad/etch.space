import React, { Component } from 'react';

class UsersBox extends Component {

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
                >
                    </input>
                </div>    
            </div>
        )
    }

}

export default UsersBox;
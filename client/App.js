import React, { Component } from 'react';
import Board from './Board';
import UsersBox from './UsersBox';
import config from '../config';

class App extends Component {

    constructor(props) {
        super(props);

        console.log('attempting connection');
        this.socket = io();

        this.state = {
            users: {}
        }
    }

    componentDidMount() {
        this.bindSocketEvents(this.socket);
    }

    bindSocketEvents(socket) {
       socket.on('users update', this.handleUserUpdate.bind(this));
    }

    handleUserUpdate(users) {
        this.setState({ users });
    }

    render() {
        return (
        <div className="page">
                <UsersBox users={this.state.users} socket={this.socket}/>
                <div className="page-center">
                    <div className="title">etch.io</div>
                    <Board socket={this.socket}/>
                    <div className="title"
                        style={{
                            fontSize: 20
                        }}
                    >move with arrow keys ←↑→↓</div>
                </div>    
        </div>
        )
    }

}

export default App;
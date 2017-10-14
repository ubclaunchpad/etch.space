import React, { Component } from 'react';
import Board from './Board';
import UsersBox from './UsersBox';
import config from '../config';

class App extends Component {

    constructor(props) {
        super(props);
        this.socket = io();
        this.state = {
            users: {}
        }
    }

    componentDidMount() {
        console.log('attempting connection');

        this.bindSocketEvents();
    }

    bindSocketEvents() {
        this.socket.on('users update', this.handleUserUpdate.bind(this));
    }

    handleUserUpdate(users) {
        this.setState({ users });
    }
    
    handleClick() {

    }
    render() {
        return (
        <div className="page">
                <UsersBox users={this.state.users} />
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
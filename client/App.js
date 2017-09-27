import React, { Component } from 'react';
import Board from './Board';
import UsersBox from './UsersBox';
import config from '../config';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            users: {}
        }
    }

    componentDidMount() {
        console.log('attempting connection');
        const socket = io();

        this.bindSocketEvents(socket);
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
                <UsersBox users={this.state.users}/>
                <Board />
        </div>
        )
    }

}

export default App;
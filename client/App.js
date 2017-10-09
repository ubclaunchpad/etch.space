import React, { Component } from 'react';
import Board from './Board';
import UsersBox from './UsersBox';
import config from '../config';
import Logo from './Logo';

class App extends Component {

    constructor(props) {
        super(props);

        console.log('attempting connection');
        this.socket = io();

        this.state = {
            users: INITIAL_USERS,
            chat: INITIAL_CHAT,
            pos: {
                x: 0,
                y: 0
            }
        }
    }

    componentDidMount() {
        this.bindSocketEvents(this.socket);
    }

    bindSocketEvents(socket) {
       socket.on('connect', this.handleConnect.bind(this));
       socket.on('disconnect', () => { location.reload() });
       socket.on('event_batch', this.handleEventBatch.bind(this));
    }

    handleConnect() {
        this.setState({
            id: this.socket.id
        })
    }

    handleEventBatch(events) {

        let chat = this.state.chat;
        let users = this.state.users;

        events.forEach(event => {

            switch (event.type) {
                case 'chat':
                    chat.push(event);
                    break;
                case 'user':
                    users[event.id] = event.user;
                    break;
                default:
                    break;
            }

        })

        this.setState({
            chat,
            users
        });
    }

    render() {
        return (
        <div className="page">
                <UsersBox
                    socket={this.socket}
                    users={this.state.users}
                    chat={this.state.chat}
                />
                <div className="page-center">
                    <Board
                        socket={this.socket}
                        id={this.state.id}
                        users={this.state.users}
                    />
                    <div className="title"
                    >move with arrow keys ←↑→↓</div>
                </div>    
        </div>
        )
    }

}

export default App;
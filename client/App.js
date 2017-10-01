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
            chat: INITIAL_CHAT
        }
    }

    componentDidMount() {
        this.bindSocketEvents(this.socket);
    }

    bindSocketEvents(socket) {
       socket.on('users update', this.handleUserUpdate.bind(this));
       socket.on('event_batch', this.handleEventBatch.bind(this));
    }

    handleEventBatch(events) {

        let chat = this.state.chat;

        events.forEach(event => {

            switch (event.type) {
                case 'chat':
                    chat.push(event);
                default:
                    break;    
            }

        })

        this.setState({ chat });

    }

    handleUserUpdate(users) {
        this.setState({
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
                    <img className="etch" src="/img/logo.png"/>
                    <Board socket={this.socket}/>
                    <div className="title"
                        style={{
                            fontSize: 18
                        }}
                    >move with arrow keys ←↑→↓</div>
                </div>    
        </div>
        )
    }

}

export default App;
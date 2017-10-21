import React, { Component } from 'react';
import _ from 'lodash';
import Board from './Board';
import UsersBox from './UsersBox';
import Popup from './Popup';

class App extends Component {
    constructor(props) {
        super(props);

        console.log('attempting connection');
        this.socket = io();

        this.state = {
            started: false,
            board: {},
            boardDiffs: [],
            chat: [],
            users: {},
            popupOpen: true,
            id: null
        };
    }

    componentDidMount() {

        document.title = "etch"

        this.socket.on('connect', this.handleConnect.bind(this));
        this.bindSocketEvents(this.socket);

        // request state

        fetch('/state')
            .then(res => res.json())
            .then((state) => {
                // replay any state recieved in the meantime
                // on top of this older state

                const mergedState = _.merge(state, this.state);
                mergedState.started = true;

                this.setState(mergedState);
            });
    }

    bindSocketEvents(socket) {
        socket.on('disconnect', () => { location.reload(); });
        socket.on('event_batch', this.handleEventBatch.bind(this));
        socket.on('tick', this.handleTick.bind(this));
    }

    handleConnect() {
        this.setState({
            id: this.socket.id
        });
    }

    handleTick(diffs) {
        const board = this.state.board;

        diffs.forEach((diff) => {
            // update board
            if (!board[diff.x]) {
                board[diff.x] = {};
            }

            board[diff.x][diff.y] = diff.color;
        }, this);

        this.setState({
            board,
            boardDiffs: diffs
        });
    }

    handleEventBatch(events) {
        const chat = this.state.chat;
        const users = this.state.users;

        events.forEach((event) => {
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
        });

        this.setState({
            chat,
            users
        });
    }

    closePopup() {
        this.setState({
            popupOpen: false
        });
    }

    render() {
        const userLoaded = !!this.state.users[this.state.id];

        if (!this.state.started || !userLoaded) {
            return null;
        }

        const user = this.state.users[this.state.id];

        return (
            <div className="page">
                {this.state.popupOpen ?
                    <Popup
                        color={user.color}
                        close={this.closePopup.bind(this)}
                        socket={this.socket}
                    />
                    : null
                }
                <UsersBox
                    socket={this.socket}
                    users={this.state.users}
                    chat={this.state.chat}
                />
                <div className="page-center">
                    <Board
                        socket={this.socket}
                        id={this.state.id}
                        user={user}
                        board={this.state.board}
                        diffs={this.state.boardDiffs}
                    />
                    <div className="title"
                    >move with arrow keys ←↑→↓</div>
                    {/* <div
                        className="created-at"
                    >
                    created at
                        <a
                            href="http://www.ubclaunchpad.com/"
                            className="created-at-link"
                        >ubclaunchpad
                        </a>
                    </div> */}
                </div>
            </div>
        );
    }
}

export default App;

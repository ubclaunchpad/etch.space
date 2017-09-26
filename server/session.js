const config = require('./config');
const socketIO = require('socket.io');

class Session {

    constructor(server) {

        this.io = socketIO(server);

        this.votes = {
            x: 0,
            y: 0
        }

        this.cursorPos = {
            x: 0,
            y: 0
        }

        this.users = {};
        this.boardState = {};

        this.io.on('connection', this.bindSocketEvents.bind(this))
    }

    start() {
        setInterval(this.flushVotes.bind(this), config.GAME.UPDATE_RATE);
    }

    bindSocketEvents(socket) {

        const id = socket.id;

        this.createUser(id);

        console.log('a user connected');
        socket.on('disconnect', this.deleteUser.bind(this, id))
        socket.on('vote', this.updateUserVote.bind(this, id));

    }
    
    updateUserVote(id, vote) {
        console.log("VOTE FROM: ", id);
        this.users[id].vote = vote;
    }

    clearUserVotes() {

        this.votes.x = 0;
        this.votes.y = 0;

        Object.values(this.users).forEach(user => {

            this.votes.x += user.vote.x;
            this.votes.y += user.vote.y;
            user.vote.x = 0;
            user.vote.y = 0;

        })

    }

    flushVotes() {
        this.clearUserVotes();
        const final = this.getMostPopular();

        if (this.cursorPos.x < config.GAME.BOARD_WIDTH) {
            this.cursorPos.x = this.cursorPos.x >= 0 ? this.cursorPos.x + final.x * 3 : 0;
        }

        if (this.cursorPos.y < config.GAME.BOARD_WIDTH) {
            this.cursorPos.y = this.cursorPos.y >= 0 ? this.cursorPos.y + final.y * 3 : 0;
        }

        this.updateBoardState(this.cursorPos.x, this.cursorPos.y);

        this.io.emit('canvaschange', this.cursorPos);
    }

    createUser(id) {
        this.users[id] = {
            vote: {
                x: 0,
                y: 0
            }
        }
    }

    deleteUser(id) {
        delete this.users[id];
    }

    updateBoardState(x, y) {
        if (!this.boardState[x]) {
            this.boardState[x] = {};
        }

        this.boardState[x][y] = true;
    }

    getMostPopular() {

        if(this.votes.x != 0) {
            this.votes.x = this.votes.x / Math.abs(this.votes.x);
        }

        if(this.votes.y != 0) {
            this.votes.y = this.votes.y / Math.abs(this.votes.y);
        }

        if(Math.abs(this.votes.x) > Math.abs(this.votes.y)) {
            this.votes.y = 0;
        }

        else {
            this.votes.x = 0;
        }

        const final = {
            x: this.votes.x,
            y: this.votes.y
        }

        return this.votes;
    }
}

module.exports = Session;
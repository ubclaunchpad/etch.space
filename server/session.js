const config = require('../config');
const socketIO = require('socket.io');

class Session {

    constructor(server) {

        this.io = socketIO(server);

        this.users = {};

        // map of x-y coordinates, values are the color of the cell
        this.boardState = {};

        this.io.on('connection', this.bindSocketEvents.bind(this))
    }

    start() {
        this.io.emit('canvasclear');
        setInterval(this.tick.bind(this), config.GAME.UPDATE_RATE);
        setInterval(this.usersUpdate.bind(this), config.GAME.USERS_UPDATE_RATE);
    }

    bindSocketEvents(socket) {

        const id = socket.id;

        this.createUser(id);

        console.log('a user connected');
        socket.on('disconnect', this.deleteUser.bind(this, id))
        socket.on('move', this.handleUserMove.bind(this, id));

    }
    
    handleUserMove(id, move) {
        const user = this.users[id];
        console.log("MOVE FROM: ", id);

        if (Math.abs(move.x) === 0 || Math.abs(move.x) === 1) {
            user.nextPos.x = user.pos.x + (move.x * config.GAME.PIXEL_SIZE);
        }

        if (Math.abs(move.y) === 0 || Math.abs(move.y) === 1) {
            user.nextPos.y = user.pos.y + (move.y * config.GAME.PIXEL_SIZE);
        }

    }

    usersUpdate() {
        this.io.emit('users update', this.users); 
    }

    tick() {

        const diffs = [];

        Object.values(this.users).forEach(user => {
            console.log(user);
            if ((user.nextPos.x !== user.pos.x) ||
                (user.nextPos.y !== user.pos.y)) {
                
                diffs.push({
                    x: user.nextPos.x,
                    y: user.nextPos.y,
                    color: user.color
                })

                user.pos.x = user.nextPos.x;
                user.pos.y = user.nextPos.y;

            }
        })

        this.updateBoardState(diffs);

        this.io.emit('tick', diffs);
    }

    createUser(id) {

        const startingPos = this.getRandomPos();
        const color = this.getRandomColor();

        console.log(startingPos);
        this.users[id] = {
            color,
            pos: startingPos,
            nextPos: {
                x: startingPos.x,
                y: startingPos.y
            }
        }

        this.updatePixel({
            x: startingPos.x,
            y: startingPos.y,
            color
        })

    }

    getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        return `rgb(${r}, ${g}, ${b})`;
    }

    getRandomPos() {
        return {
            x: parseInt(Math.random() * (config.GAME.BOARD_WIDTH - config.GAME.PIXEL_SIZE)),
            y: parseInt(Math.random() * (config.GAME.BOARD_HEIGHT - config.GAME.PIXEL_SIZE))
        }
    }

    deleteUser(id) {
        delete this.users[id];
    }

    updatePixel(item) {
        if (!this.boardState[item.x]) {
            this.boardState[item.x] = {};
        }

        this.boardState[item.x][item.y] = item.color;
    }

    updateBoardState(diffs) {
        diffs.forEach(diff => this.updatePixel(diff))
   }
}

module.exports = Session;
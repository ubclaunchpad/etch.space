const config = require('../config');
const socketIO = require('socket.io');
const moment = require('moment');
const _ = require('lodash');

class Session {

    constructor(server) {

        this.io = socketIO(server);

        this.users = {};
        this.chat = [];

        // chat events, user nickname events
        this.events = [];

        // map of x-y coordinates, values are the color of the cell
        this.boardState = {};

        this.io.on('connection', this.bindSocketEvents.bind(this))
    }

    bindSocketEvents(socket) {

        const id = socket.id;

        this.createUser(id);

        console.log('a user connected');
        socket.on('move', this.handleMoveEvent.bind(this, id));
        socket.on('chat', this.handleChatEvent.bind(this, id));
        socket.on('nickname', this.handleNicknameEvent.bind(this, id));
        socket.on('disconnect', this.disconnectUser.bind(this, id))

    }

    start() {
        this.io.emit('canvasclear');
        setInterval(this.tick.bind(this), config.GAME.UPDATE_RATE);
        setInterval(this.processEvents.bind(this), config.GAME.USERS_UPDATE_RATE);
    }

    // go through pending events
    // process them and emit a changes event
    processEvents() {

        if (this.events.length) {

            console.log(this.events);

            this.events.forEach((event) => {
                switch (event.type) {
                    case 'chat':
                        this.chat.push(event);
                        break;
                    case 'user':
                        this.users[event.id] = event.user;
                    default:
                        break;    
                }
            })

            this.io.emit('event_batch', this.events);
            this.events = [];
        }

    }

    handleChatEvent(id, content) {

        const stamp = new moment().unix();

        this.events.push({
            type: 'chat',
            id,
            content,
            stamp
        })
    }

    handleNicknameEvent(id, nickname) {
        // if user already has nickname, ignore it
        if (this.users[id] && this.users[id].nick === config.GAME.DEFAULT_USER_NICKNAME) {
            const newUser = _.cloneDeep(this.users[id]);
            newUser.nick = nickname;

            this.createUserEvent(id, newUser);

        }
    }
    
    handleMoveEvent(id, move) {
        const user = this.users[id];

        if (Math.abs(move.x) === 0 || Math.abs(move.x) === 1) {
            user.nextPos.x = user.pos.x + move.x;
            user.nextPos.x = Math.min(user.nextPos.x, config.GAME.BOARD_WIDTH);
        }

        if (Math.abs(move.y) === 0 || Math.abs(move.y) === 1) {
            user.nextPos.y = user.pos.y + move.y;
            user.nextPos.y = Math.min(user.nextPos.y, config.GAME.BOARD_HEIGHT);
        }

    }

    tick() {

        const diffs = [];

        Object.values(this.users).forEach(user => {
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

        const user = {
            color,
            pos: startingPos,
            nextPos: {
                x: startingPos.x,
                y: startingPos.y
            },
            nick: 'anonymous',
            connected: true
        }

        this.createUserEvent(id, user);

        this.updatePixel({
            x: startingPos.x,
            y: startingPos.y,
            color
        })

    }

    createUserEvent(id, user) {
                this.events.push({
                    type: 'user',
                    id,
                    user
                })
            }

    disconnectUser(id) {
        if (this.users[id]) {
            const newUser = _.cloneDeep(this.users[id]);
            newUser.connected = false;
            this.createUserEvent(id, newUser);
        }
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
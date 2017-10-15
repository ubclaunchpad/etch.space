const config = require('../config');
const socketIO = require('socket.io');
const moment = require('moment');
const _ = require('lodash');
const Recorder = require('./recorder');
const logger = require('./logger');

class Session {
    constructor(server) {
        // process.on('uncaughtException', this.handleCrash.bind(this));

        this.io = socketIO(server);

        this.users = {};
        this.chat = [];

        // chat events, user nickname events
        this.events = [];

        // map of x-y coordinates, values are the color of the cell
        this.board = {};

        this.recording = false;
        this.recorder = null;

        this.io.on('connection', this.bindSocketEvents.bind(this));
    }

    bindSocketEvents(socket) {
        const id = socket.id;

        this.createUser(id);

        logger.info('User connected');
        socket.on('move', this.handleMoveEvent.bind(this, id));
        socket.on('chat', this.handleChatEvent.bind(this, id));
        socket.on('nickname', this.handleNicknameEvent.bind(this, id));
        socket.on('disconnect', this.disconnectUser.bind(this, id));
    }


    start() {
        setInterval(this.tick.bind(this), config.GAME.UPDATE_RATE);
        setInterval(this.processEvents.bind(this), config.GAME.USERS_UPDATE_RATE);
    }

    // go through pending events
    // process them and emit a changes event
    processEvents() {
        if (this.events.length) {
            this.events.forEach((event) => {
                switch (event.type) {
                case 'chat':
                    this.chat.push(event);
                    break;
                case 'user':
                    this.users[event.id] = event.user;
                    break;
                default:
                    break;
                }
            });

            this.io.emit('event_batch', this.events);
            this.events = [];
        }
    }

    handleChatEvent(id, content) {
        if (content.length > config.CHAT.MESSAGE_MAX_LEN) {
            return;
        }

        const stamp = new moment().unix();

        this.events.push({
            type: 'chat',
            id,
            content,
            stamp
        });
    }

    handleNicknameEvent(id, nickname) {
        // if length too high, ignore
        if (nickname.length > config.GAME.NICKNAME_MAX_LEN || nickname.length < config.GAME.NICKNAME_MIN_LEN) {
            return;
        }

        // if user already has nickname, ignore it
        if (this.users[id] && this.users[id].nick === config.GAME.NICKNAME_DEFAULT) {
            const newUser = _.cloneDeep(this.users[id]);
            newUser.nick = nickname;

            this.createUserEvent(id, newUser);
        }
    }

    handleMoveEvent(id, move) {
        const user = this.users[id];

        if (!user) { return; }

        if (Math.abs(move.x) === 0 || Math.abs(move.x) === 1) {
            user.nextPos.x = user.pos.x + move.x;
            user.nextPos.x = Math.max(0, Math.min(user.nextPos.x, config.GAME.BOARD_WIDTH - 1));
        }

        if (Math.abs(move.y) === 0 || Math.abs(move.y) === 1) {
            user.nextPos.y = user.pos.y + move.y;
            user.nextPos.y = Math.max(0, Math.min(user.nextPos.y, config.GAME.BOARD_HEIGHT - 1));
        }
    }

    tick() {
        const diffs = [];

        Object.keys(this.users).forEach((id) => {
            const user = this.users[id];

            if ((user.nextPos.x !== user.pos.x) ||
                (user.nextPos.y !== user.pos.y)) {
                diffs.push({
                    x: user.nextPos.x,
                    y: user.nextPos.y,
                    color: user.color,
                    cursorColor: user.cursorColor,
                    id
                });

                user.pos.x = user.nextPos.x;
                user.pos.y = user.nextPos.y;
            }
        });

        this.updateBoard(diffs);

        if (this.recording) {
            this.recorder.appendFrame(diffs);
        }

        if (diffs.length) {
            this.io.emit('tick', diffs);
        }
    }

    createUser(id) {
        const startingPos = this.getRandomPos();
        const color = this.getLimitedRandomColor(0.2, 0.8);
        const cursorColor = this.offsetColor(color);

        const user = {
            color: this.colorToRGB(color),
            cursorColor: this.colorToRGB(cursorColor),
            pos: startingPos,
            nextPos: {
                x: startingPos.x,
                y: startingPos.y
            },
            nick: config.GAME.NICKNAME_DEFAULT,
            connected: true
        };

        this.createUserEvent(id, user);

        this.updatePixel({
            x: startingPos.x,
            y: startingPos.y,
            color: this.colorToRGB(color)
        });
    }

    createUserEvent(id, user) {
        this.events.push({
            type: 'user',
            id,
            user
        });
    }

    disconnectUser(id) {
        if (this.users[id]) {
            const newUser = _.cloneDeep(this.users[id]);
            newUser.connected = false;
            this.createUserEvent(id, newUser);
        }
    }

    getRandomColorComponents() {
        return {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256)
        };
    }

    getRandomColor() {
        const color = this.getRandomColorComponents();
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    getLimitedRandomColor(minBrightness, maxBrightness) {
        do {
            var color = this.getRandomColorComponents();
        } while (this.calcBrightness(color) > maxBrightness || this.calcBrightness(color) < minBrightness);

        return color;
    }

    colorToRGB(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    calcBrightness(color) {
        return (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;
    }

    offsetColor(color) {
        const brightness = this.calcBrightness(color);
        const newColor = {
            r: color.r,
            g: color.g,
            b: color.b
        };
        if (brightness > 0.5) {
            for (var key in newColor) {
                newColor[key] = Math.min(Math.floor(newColor[key] * 0.5), 255);
            }
        } else {
            for (var key in newColor) {
                newColor[key] = Math.min(Math.floor(newColor[key] * 2), 255);
            }
        }
        return newColor;
    }

    getRandomPos() {
        return {
            x: parseInt(Math.random() * (config.GAME.BOARD_WIDTH - config.GAME.PIXEL_SIZE)),
            y: parseInt(Math.random() * (config.GAME.BOARD_HEIGHT - config.GAME.PIXEL_SIZE))
        };
    }

    updatePixel(item) {
        if (!this.board[item.x]) {
            this.board[item.x] = {};
        }

        this.board[item.x][item.y] = item.color;
    }

    updateBoard(diffs) {
        diffs.forEach(diff => this.updatePixel(diff));
    }

    toggleRecord() {
        if (!this.recorder) {
            this.recorder = new Recorder();
        } else {
            this.recorder = null;
        }

        this.recording = !this.recording;
    }

    // handleCrash(err) {
    //     logger.info('Unhandled Exception: ');

    //     logger.info('STATE: ');

    //     logger.info('USERS: ');
    //     logger.info(JSON.stringify(this.users));

    //     logger.info('CHAT: ');
    //     logger.info(JSON.stringify(this.chat));

    //     logger.info('EVENTS: ');
    //     logger.info(JSON.stringify(this.events));

    //     logger.info('BOARD: ');
    //     logger.info(JSON.stringify(this.board));

    //     logger.error(err.stack);

    //     // kinda hacky, but writing to the log is async
    //     // so we can't exit right away
    //     setTimeout(() => { process.exit(1); }, 2000);
    // }
}

module.exports = Session;

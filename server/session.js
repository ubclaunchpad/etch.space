const config = require('../config');
const socketIO = require('socket.io');
const moment = require('moment');
const _ = require('lodash');
const Recorder = require('./recorder');
const logger = require('./logger');

const validateSchema = require('./validation').validateSchema;

const EVENT_NAMES = ['move', 'chat', 'nickname', 'disconnect'];
const EVENT_SCHEMAS = require('./events/schemas');

class Session {
    constructor(server, dbConn) {
        // process.on('uncaughtException', this.handleCrash.bind(this));

        this.DB = dbConn;
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

    loadInitialState(state) {
        this.chat = state.chat;
        this.board = state.board;
    }

    bindSocketEvents(socket) {
        this.createUser(socket.id);

        logger.info('User connected');

        EVENT_NAMES.forEach((name) => {
            socket.on(name, this.handleEvent.bind(this, { name, id: socket.id }));
        }, this);
    }

    handleEvent(info, event) {
        const EVENT_HANDLERS = {
            move: this.handleMoveEvent,
            chat: this.handleChatEvent,
            nickname: this.handleNicknameEvent,
            disconnect: this.handleDisconnectEvent
        };

        if (!EVENT_SCHEMAS[info.name]) { return; }

        if (validateSchema(EVENT_SCHEMAS[info.name], event)) {
            EVENT_HANDLERS[info.name].call(this, info.id, event);
        }
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

    handleChatEvent(id, event) {
        const stamp = new moment().unix();

        const message = {
            userId: id,
            content: event.value,
            stamp,
            nick: this.users[id].nick,
            color: this.users[id].color
        };

        this.DB.models.chat.create(message)
            .then(() => {
                this.events.push({
                    type: 'chat',
                    userId: id,
                    content: event.value,
                    stamp,
                    nick: this.users[id].nick,
                    color: this.users[id].color
                });
            });
    }

    handleNicknameEvent(id, event) {
        const newUser = _.cloneDeep(this.users[id]);
        newUser.nick = event.value;

        this.createUserEvent(id, newUser);
    }

    handleMoveEvent(id, event) {
        const user = this.users[id];

        if (!user) { return; }

        user.nextPos.x = user.pos.x + event.x;
        user.nextPos.x = Math.max(0, Math.min(user.nextPos.x, config.BOARD.WIDTH - 1));

        user.nextPos.y = user.pos.y + event.y;
        user.nextPos.y = Math.max(0, Math.min(user.nextPos.y, config.BOARD.HEIGHT - 1));
    }

    tick() {
        const diffs = [];

        Object.keys(this.users).forEach((id) => {
            const user = this.users[id];

            if ((user.nextPos.x !== user.pos.x) ||
                (user.nextPos.y !== user.pos.y)) {
                user.pixelCount++;
                this.createUserEvent(id, user);
                // console.log(user.pixelCount);

                diffs.push({
                    x: user.nextPos.x,
                    y: user.nextPos.y,
                    color: user.color,
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
            this.DB.models.board.update(diffs);
            this.io.emit('tick', diffs);
        }
    }

    createUser(id) {
        const startingPos = this.getRandomPos();
        const color = this.getLimitedRandomColor(0.2, 0.8);
        const cursorColor = this.offsetColor(color);

        const user = {
            id,
            color: this.colorToRGB(color),
            cursorColor: this.colorToRGB(cursorColor),
            pos: startingPos,
            pixelCount: 0,
            nextPos: {
                x: startingPos.x,
                y: startingPos.y
            },
            nick: config.NICKNAME.DEFAULT,
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

    handleDisconnectEvent(id) {
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
            x: parseInt(Math.random() * (config.BOARD.WIDTH - config.GAME.PIXEL_SIZE)),
            y: parseInt(Math.random() * (config.BOARD.HEIGHT - config.GAME.PIXEL_SIZE))
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

const devConfig = require('./dev.config');
const _ = require('lodash');

let config = {
    SERVER: {
        PORT: 3000,
    },
    GAME: {
        UPDATE_RATE: 50,
        USERS_UPDATE_RATE: 1000,
        PIXEL_SIZE: 3,
        SPIN_FACTOR: 3
    },
    BOARD: {
        HEIGHT: 150, // actual size will be these times PIXEL_SIZE
        WIDTH: 250,
        BEZEL_THICKNESS: 40,
        BG_COLOR: '#eaeaea'
    },
    NICKNAME: {
        DEFAULT: 'anonymous',
        MAX_LEN: 25,
        MIN_LEN: 1
    },
    CHAT: {
        MESSAGE_MAX_LEN: 200
    }
}
    ;

if (process.env.NODE_ENV === 'development') {
    config = _.merge(config, devConfig);
}

module.exports = config;
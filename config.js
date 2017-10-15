module.exports = {
    SERVER: {
        PORT: 3000
    },
    GAME: {
        UPDATE_RATE: 50,
        USERS_UPDATE_RATE: 1000,
        BOARD_HEIGHT: 150, // actual size will be these times PIXEL_SIZE
        BOARD_WIDTH: 250,
        BOARD_BEZEL_THICKNESS: 60,
        BOARD_BG_COLOR: '#eaeaea',
        PIXEL_SIZE: 3,
        NICKNAME_DEFAULT: 'anonymous',
        NICKNAME_MAX_LEN: 25,
        NICKNAME_MIN_LEN: 1,
        SPIN_FACTOR: 3
    },
    CHAT: {
        MESSAGE_MAX_LEN: 200
    }
}
;

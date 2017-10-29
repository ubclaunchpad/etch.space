const Sequelize = require('sequelize');
const config = require('../../config');
const logger = require('../logger');

const User = require('./user');
const Chat = require('./chat');
const Board = require('./board');

class DB {
    constructor() {
        // connect to DB
        this.conn = new Sequelize(config.DB.NAME, config.DB.USERNAME, config.DB.PASSWORD, {
            host: config.DB.HOSTNAME,
            dialect: 'postgres',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
            logging: true
        });

        this.models = {
            chat: new Chat(this.conn),
            board: new Board(this.conn)
        };
    }

    connect() {
        // test connection
        return this.conn.authenticate()
            .then(() => {
                logger.info('DB Connection established successfully.');

                // sync models with DB (create tables automatically)
                logger.info('Syncing models with DB...');
                return Promise.all(
                    Object.values(this.models).map(model => model.sync())
                );
            })
            .catch((err) => {
                logger.error(err);
            });
    }

    getInitialState() {
        logger.info('Getting initial state from DB...');
        const state = {};

        const statePromises = [
            this.models.chat.getAll(),
            this.models.board.get()
        ];

        return Promise.all(statePromises)
            .then((data) => {
                state.chat = data[0];
                state.board = data[1];
                return state;
            });
    }
}


module.exports = DB;

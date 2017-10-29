const Sequelize = require('sequelize');
const config = require('../../config');
const logger = require('../logger');

const User = require('./user');

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
    }

    connect() {
        // test connection
        return this.conn.authenticate()
            .then(() => {
                logger.info('DB Connection established successfully.');

                // get models
                this.models = {
                    user: new User(this.conn)
                };

                // sync models with DB (create tables automatically)
                logger.info('Syncing models with DB...');
                return Promise.all(
                    Object.values(this.models).map(model => model.sync())
                );

            // sync models
            })
            .catch((err) => {
                logger.error(err);
            });
    }

    getInitialState() {
        logger.info('Getting initial state from DB...');
        const data = {};

        return this.models.user.getAll()
            .then((users) => {
                data.users = users;
                return data;
            });
    }
}


module.exports = DB;

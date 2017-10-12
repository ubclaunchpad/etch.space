const winston = require('winston');
const moment = require('moment');

const LOG_NAME = moment().format() + '.log';
const LOG_PATH = './server/log/' + LOG_NAME;

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.File({
            filename: LOG_PATH,
            format: winston.format.simple(),
            handleExceptions: true
        }),
        new winston.transports.Console({
            'timestamp': true,
            format: winston.format.simple(),
            handleExceptions: true
        })
    ],
});

module.exports = logger;
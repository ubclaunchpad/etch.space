const winston = require('winston');
const moment = require('moment');
const fs = require('fs');

const LOG_NAME = moment().format() + '.log';
const LOG_DIR = './server/log'
const LOG_PATH = LOG_DIR + '/' + LOG_NAME;

// create log directory
if (!fs.existsSync(LOG_DIR)){
    fs.mkdirSync(LOG_DIR);
}

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
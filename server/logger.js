const winston = require('winston');
const moment = require('moment');
const fs = require('fs');

const LOG_NAME = `${moment().format()}.log`;
const LOG_DIR = './server/log';
const LOG_PATH = `${LOG_DIR}/${LOG_NAME}`;

// create log directory
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

const format = winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`);

const formats = winston.format.combine(
    winston.format.timestamp(),
    format
);

const transports = [
    new winston.transports.File({
        filename: LOG_PATH,
        format: formats
    })
];

// only log to console in development
if (process.env.NODE_ENV === 'development') {
    transports.push(
        new winston.transports.Console({
            format: formats
        })
    );
}

const logger = winston.createLogger({
    level: 'info',
    transports
});

module.exports = logger;

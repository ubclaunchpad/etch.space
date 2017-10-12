const fs = require('fs');
const moment = require('moment');
const logger = require('./logger');

class Recorder {

    constructor() {
        this.name = moment().format();

        this.frames = 0;

        const DIR = __dirname + '/rec'
        const EXT = '.rec';

        this.path = DIR + '/' + this.name + EXT;

        // create directory
        if (!fs.existsSync(DIR)){
            fs.mkdirSync(DIR);
        }

        // create empty file
        fs.closeSync(fs.openSync(this.path, 'w'));
    }

    appendFrame(board) {
        fs.appendFile(this.path, JSON.stringify(board) + '\n', function (err) {
            if (err) {
                logger.error(err)
            }
        });
    }
}

module.exports = Recorder;
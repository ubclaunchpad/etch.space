const fs = require('fs');
const moment = require('moment');

class Recorder {

    constructor() {
        this.name = moment().format();

        const DIR = __dirname + '/recordings'
        const EXT = '';

        this.path = DIR + '/' + this.name + EXT;

        // create directory
        if (!fs.existsSync(DIR)){
            fs.mkdirSync(DIR);
        }

        // create empty file
        fs.closeSync(fs.openSync(this.path, 'w'));
    }

    appendFrame(board) {
        fs.appendFile(this.path,JSON.stringify(board) + '\n', function (err) {
            if (err) {
                console.log(err);
            }
            console.log('Saved frame');
        });
    }

}

module.exports = Recorder;
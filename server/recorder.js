const config = require('../config');
const fs = require('fs');
const moment = require('moment');
const logger = require('./logger');

const GIFEncoder = require('gifencoder');
const Canvas = require('canvas');

class Recorder {
    constructor() {
        this.name = moment().format();

        this.frames = 0;

        this.encoder = new GIFEncoder(config.BOARD.WIDTH, config.BOARD.HEIGHT);

        const DIR = `${__dirname}/rec`;
        const EXT = '.rec';

        this.path = `${DIR}/${this.name}${EXT}`;

        // create directory
        if (!fs.existsSync(DIR)) {
            fs.mkdirSync(DIR);
        }

        // create empty file
        fs.closeSync(fs.openSync(this.path, 'w'));
   
        // stream the results as they are available into myanimated.gif 
        this.encoder.createReadStream().pipe(fs.createWriteStream(this.path+'.gif'));
        
        this.encoder.start();
        this.encoder.setRepeat(config.RECORDING.REPEAT);   // 0 for repeat, -1 for no-repeat 
        this.encoder.setDelay(config.RECORDING.DELAY);  // frame delay in ms 
        this.encoder.setQuality(config.RECORDING.QUALITY); // image quality. 10 is default. 

        // use node-canvas 
        this.canvas = new Canvas(config.BOARD.WIDTH, config.BOARD.HEIGHT);
        this.ctx = this.canvas.getContext('2d'); 
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0,0, config.BOARD.WIDTH, config.BOARD.HEIGHT);
    }

    finishGifCapture() {
        this.encoder.finish();
        var out = fs.createWriteStream(__dirname + '/text.png'), stream = this.canvas.pngStream();
      
        stream.on('data', function(chunk){
            out.write(chunk);
         } );
      
        stream.on('end', function(){
            console.log('saved png');
         });
    }

    appendFrame(board) {
        board.forEach(function (diff) {
            console.log(diff);
            this.ctx.fillStyle = diff.color;
            this.ctx.fillRect(diff.x, diff.y, 1, 1);
        }, this);

        this.encoder.addFrame(this.ctx);
        fs.appendFile(this.path, `${JSON.stringify(board)}\n`, (err) => {
            if (err) {
                logger.error(err);
            }
        });
    }
}

module.exports = Recorder;

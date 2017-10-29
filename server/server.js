const express = require('express');

const fs = require('fs');
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

const app = express();
const server = require('https').createServer(options, app);
const config = require('../config');
const Session = require('./session');
const cookieParser = require('cookie-parser');
const logger = require('./logger');

app.set('view engine', 'ejs');
app.set('views', 'public');
app.use(cookieParser());
app.use(express.static('public'));

const session = new Session(server);
session.start();

app.get('/', (req, res) => {
    if (req.cookies && req.cookies.io) {
        session.disconnectUser(req.cookies.io);
    }

    res.render('index', {});
});

app.get('/state', (req, res) => {
    res.json({
        board: session.board,
        chat: session.chat,
        users: session.users
    });
});

app.get('/record', (req, res) => {
    session.toggleRecord();

    if (session.recording) {
        logger.info('Started recording');
        res.json({
            message: 'Successfully started recording.'
        });
    } else {
        logger.info('Stopped recording');
        res.json({
            message: 'Successfully stopped recording.'
        });
    }
});

// error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Internal Error');
});

server.listen(config.SERVER.PORT, () => {
    logger.info(`listening on *:${config.SERVER.PORT}`);
});

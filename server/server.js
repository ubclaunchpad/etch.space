    const express = require('express');
    const app = express();
    const server = require('http').Server(app);
    const config = require('../config');
    const Session = require('./session');
    const cookieParser = require('cookie-parser');

    app.set('view engine', 'ejs');  
    app.set('views', 'public');
    app.use(cookieParser());
    app.use(express.static('public'))

    const session = new Session(server, {
       record: true 
    });
    session.start();

    app.get('/', function (req, res) {  
       
        // if (req.cookies && req.cookies.io) {
        //     session.disconnectUser(req.cookies.io);
        // }

        res.render('index', {});
    });

    app.get('/state', (req, res) => {
        res.json({
                board: session.board,
                chat: session.chat,
                users: session.users
        })
    })

    server.listen(config.SERVER.PORT, function(){
        console.log(`listening on *:${config.SERVER.PORT}`);
    });
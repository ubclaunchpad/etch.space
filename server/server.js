    const express = require('express');
    const app = express();
    const server = require('http').Server(app);
    const config = require('./config');
    const Session = require('./session');

    app.set('view engine', 'ejs');  
    app.set('views', 'public');
    app.use(express.static('public'))

    const session = new Session(server);
    session.start();

    app.get('/', function(req, res) {  
        res.render('index', { boardState: session.boardState })
    });

    server.listen(config.SERVER.PORT, function(){
        console.log(`listening on *:${config.SERVER.PORT}`);
    });
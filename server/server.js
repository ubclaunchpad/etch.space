(function () {
    require('dotenv').config();
    const ENV = process.env.ENV || "development";    
    var express = require('express');
    var app = express();
    var knexConfig = require('../knexfile');
    var knex = require('knex')(knexConfig[ENV]);
    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    const PORT = 3000;

    const BOARD_HEIGHT = 400;
    const BOARD_WIDTH = 700;
    const DRAW_RATE = 100;

    const votes = {
        x: 0,
        y: 0
    };

    const cursorPos = {
        x: 0,
        y: 0
    }

    // map of connected users (keys are the socket ids)
    const users = {
    }

    var boardState = {};

    app.set('view engine', 'ejs');  
    app.set('views', 'public');
    app.use(express.static('public'))

    app.get('/', function(req, res) {  
        res.render('index', { boardState })
    });

    setInterval(flushVotes, DRAW_RATE);

    io.on('connection', function (socket) {
       
        const id = socket.id;

        createUser(id);

        console.log('a user connected');
        socket.on('disconnect', function () {
            deleteUser(id);
            console.log('user disconnected');
        });

        socket.on('vote', (vote) => updateUserVote(id, vote));
    });

    http.listen(PORT, function(){
        console.log(`listening on *:${PORT}`);
    });

    function updateUserVote(id, vote) {
        console.log("VOTE FROM: ", id);
        users[id].vote = vote;
    }

    function clearUserVotes() {

        votes.x = 0;
        votes.y = 0;

        Object.values(users).forEach(user => {

            votes.x += user.vote.x;
            votes.y += user.vote.y;
            user.vote.x = 0;
            user.vote.y = 0;

        });

    }

    function flushVotes() {
        clearUserVotes();
        console.log(votes);
        var final = mostPopular(votes);

        //console.log(final);

        if (cursorPos.x < BOARD_WIDTH) {
            cursorPos.x = cursorPos.x >= 0 ? cursorPos.x + final.x * 3 : 0;
        }
        if (cursorPos.y < BOARD_WIDTH) {
            cursorPos.y = cursorPos.y >= 0 ? cursorPos.y + final.y * 3 : 0;
        }

        //console.log(cursorPos);

        updateBoardState(cursorPos.x, cursorPos.y);

        io.emit('canvaschange', cursorPos);
    }

    function createUser(id) {
        users[id] = {
            vote: {
                x: 0,
                y: 0
            }
        }
    }

    function deleteUser(id) {
        delete users[id];
    }

    function updateBoardState(x, y) {
        if (!boardState[x]) {
            boardState[x] = {};
        }

        boardState[x][y] = true;
    }

    function mostPopular(votes) {
        if(votes.x != 0) {
            votes.x = votes.x / Math.abs(votes.x);
        }
        if(votes.y != 0) {
            votes.y = votes.y / Math.abs(votes.y);
        }

        if(Math.abs(votes.x) > Math.abs(votes.y)) {
            votes.y = 0;
        }
        else {
            votes.x = 0;
        }

        var final = {
            x: votes.x,
            y: votes.y
        }

        votes.x = 0;
        votes.y = 0;

        return final;
    }
})();

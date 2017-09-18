(function () {
    var express = require('express');
    var app = express();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    var votes = {
        horizontal: 0,
        vertical: 0
    };

    var cursorPos = {
        x: 0,
        y: 0
    }

    app.use(express.static('public'))

    setInterval(flushVotes, 100);

    io.on('connection', function(socket){
        console.log('a user connected');
        socket.emit('msg', Math.random());
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });

        socket.on('vote', addVote);
    });

    http.listen(3000, function(){
        console.log('listening on *:3000');
    });

    function addVote(vote){
        if(vote.horizontal < 0) {
            votes.horizontal--;
        }
        else if(vote.horizontal > 0) {
            votes.horizontal++;
        }
        else if(vote.vertical > 0) {
            votes.vertical++;
        }
        else if(vote.vertical < 0) {
            votes.vertical--;
        }

        console.log(votes);
    }

    function flushVotes() {
        var final = mostPopular(votes);

        console.log(final);

        cursorPos.x += final.horizontal;
        cursorPos.y += final.vertical;

        console.log(cursorPos);
        io.emit('canvaschange', cursorPos);
    }

    function mostPopular(votes) {
        if(votes.horizontal != 0) {
            votes.horizontal = votes.horizontal / Math.abs(votes.horizontal);
        }
        if(votes.vertical != 0) {
            votes.vertical = votes.vertical / Math.abs(votes.vertical);
        }

        if(Math.abs(votes.horizontal) > Math.abs(votes.vertical)) {
            votes.vertical = 0;
        }
        else {
            votes.horizontal = 0;
        }

        var final = {
            horizontal: votes.horizontal,
            vertical: votes.vertical
        }

        votes.horizontal = 0;
        votes.vertical = 0;

        return final;
    }
})();
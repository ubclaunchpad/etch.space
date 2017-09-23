(function () {
    window.onload = function () {
        var canvas = document.getElementById('sketch');
        var ctx = canvas.getContext('2d');

        drawInitialBoard();

        console.log('attempting connection');
        var socket = io();
    
        socket.on('msg', function(msg) {
            console.log(msg);
        });

        socket.on('canvaschange', function(c) {
            drawPixel(c.x, c.y);
        });

        document.onkeydown = function(e) {
            console.log('down');
            e = e || window.event;
            
            if (e.keyCode == '38') {
                socket.emit('vote', {x: 0, y: -1});
            }
            else if (e.keyCode == '40') {
                socket.emit('vote', {x: 0, y: 1});
            }
            else if (e.keyCode == '37') {
                socket.emit('vote', {x: -1, y: 0});
            }
            else if (e.keyCode == '39') {
                socket.emit('vote', {x: 1, y: 0});
            }
        }

        function drawPixel(x, y) {
            ctx.fillStyle = 'rgba(0,0,0,255)';
            ctx.fillRect( x, y, 3, 3 );
        }

        function drawInitialBoard() {

            Object.keys(INITIAL_BOARD).forEach(x => {
                Object.keys(INITIAL_BOARD[x]).forEach(y => {
                    drawPixel(x, y);
                })
            })

        }

    }
})()
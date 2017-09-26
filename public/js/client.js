window.onload = function () {

    const PIXEL_SIZE = 3;
    const BOARD_WIDTH = 700;
    const BOARD_HEIGHT = 400;
    const BOARD_BG_COLOR = '#ffffff';

    var canvas = document.getElementById('sketch');
    var ctx = canvas.getContext('2d');

    drawInitialBoard();

    console.log('attempting connection');
    var socket = io();

    socket.on('msg', function(msg) {
        console.log(msg);
    });

    socket.on('tick', function (diffs) {
        diffs.forEach(diff => {
            drawPixel(diff.x, diff.y, diff.color);
        })

    });

    // socket.on('canvasclear', function () {
    //     for (let x = 0; x <= BOARD_WIDTH; x++) {
    //         for (let y = 0; y <= BOARD_HEIGHT; y++) {
    //             drawPixel(x, y, BOARD_BG_COLOR);
    //         }
    //     }
    // })

    document.onkeydown = function(e) {
        console.log('down');
        e = e || window.event;
        
        if (e.keyCode == '38') {
            socket.emit('move', {x: 0, y: -1});
        }
        else if (e.keyCode == '40') {
            socket.emit('move', {x: 0, y: 1});
        }
        else if (e.keyCode == '37') {
            socket.emit('move', {x: -1, y: 0});
        }
        else if (e.keyCode == '39') {
            socket.emit('move', {x: 1, y: 0});
        }
    }

    function drawPixel(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect( x, y, 3, 3 );
    }

    function drawInitialBoard() {

        Object.keys(INITIAL_BOARD).forEach(x => {
            Object.keys(INITIAL_BOARD[x]).forEach(y => {
                drawPixel(x, y, INITIAL_BOARD[x][y]);
            })
        })

    }

}
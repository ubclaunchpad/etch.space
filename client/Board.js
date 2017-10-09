import React, { Component } from 'react';
import config from '../config';

class Board extends Component {

    constructor(props) {
        super(props);
        this.blinkState = false;

        this.ctx = {};

        this.state = {
            board: INITIAL_BOARD,
            pos: {
                x: null,
                y: null
            }
        }

        // setInterval(this.blinkPos.bind(this), config.GAME.CURSOR_BLINK_RATE);

    }

    componentDidMount() {
        this.drawInitialBoard();

        this.bindSocketEvents(this.props.socket);
    }

    bindSocketEvents(socket) {

        socket.on('tick', this.handleTick.bind(this));

        document.onkeydown = function (e) {
            console.log('down');
            e = e || window.event;
    
            if (e.keyCode == '38') {
                socket.emit('move', { x: 0, y: -1 });
            }
            else if (e.keyCode == '40') {
                socket.emit('move', { x: 0, y: 1 });
            }
            else if (e.keyCode == '37') {
                socket.emit('move', { x: -1, y: 0 });
            }
            else if (e.keyCode == '39') {
                socket.emit('move', { x: 1, y: 0 });
            }
        }

    }        

    handleTick(diffs) {

        const board = this.state.board;

        diffs.forEach(function (diff) {
           
            // look for our id in the list of diffs
            // update out current position
            // draw black pixel on current pos
            if (diff.id === this.props.id) {
                this.updatePos(diff.x, diff.y); 
            }
            else {
                this.drawPixel(diff.x, diff.y, diff.color);
            }


            // update board
            if (!board[diff.x]) {
                board[diff.x] = {};
            }
    
            board[diff.x][diff.y] = diff.color;

        }, this);

        this.setState({ board })

    }

    updateBoardState(diffs) {
        diffs.forEach(diff => this.updatePixel(diff))
   }

    updatePos(x, y) {

        if (this.state.pos.x !== null && this.state.pos.y !== null) {
            this.drawPixel(
                this.state.pos.x,
                this.state.pos.y,
                this.state.board[this.state.pos.x][this.state.pos.y]
            );
        }

        this.drawPixel(
            x,
            y,
            'black'
        );

        this.setState({
            pos: {
                x,
                y
            }
        })
    }

    drawPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect( x, y, 1, 1);
    }

    clearPixel(x, y, layer) {
        this.ctx[layer].clearRect( 0, 0, config.GAME.BOARD_WIDTH, config.GAME.BOARD_HEIGHT);
    }

    blinkPos() {

        const x = this.state.pos.x;
        const y = this.state.pos.y;

        if (x === null || y === null) {
            return;
        }

        if (this.blinkState) {
            this.drawPixel(x, y, config.GAME.BOARD_BG_COLOR, 1);
        }
        else {
            this.drawPixel(x, y, 'black', 1);
        }
        this.blinkState = !this.blinkState;
    }

    drawInitialBoard() {
        Object.keys(INITIAL_BOARD).forEach(x => {
            Object.keys(INITIAL_BOARD[x]).forEach(y => {
                this.drawPixel(x, y, INITIAL_BOARD[x][y]);
            })
        })
    }

    clearBoard() {
        for (let x = 0; x <= config.GAME.BOARD_WIDTH; x++) {
            for (let y = 0; y <= config.GAME.BOARD_HEIGHT; y++) {
                this.drawPixel(x, y, config.GAME.BOARD_BG_COLOR);
            }
        }
    }

    getCanvasRef(element) {
        if (element) {
            this.canvas = element;
            this.ctx = element.getContext('2d');
        }
    }

    render() {
        return (
            <div
                className="housing"
                style={{
                    width: config.GAME.BOARD_BEZEL_THICKNESS * 2 + config.GAME.BOARD_WIDTH * config.GAME.PIXEL_SIZE,
                    height: config.GAME.BOARD_BEZEL_THICKNESS * 2 + config.GAME.BOARD_HEIGHT * config.GAME.PIXEL_SIZE
                }}
            >
            <div className="wrapper">
                    <canvas
                        className="sketch"    
                        style={{
                            background: config.GAME.BOARD_BG_COLOR,
                            width: config.GAME.BOARD_WIDTH * config.GAME.PIXEL_SIZE,
                            height: config.GAME.BOARD_HEIGHT * config.GAME.PIXEL_SIZE
                        }}
                        ref={this.getCanvasRef.bind(this)}    
                        width={config.GAME.BOARD_WIDTH}
                        height={config.GAME.BOARD_HEIGHT}
                    >
                </canvas>
            </div>
            <div
                style={{
                     transform: `rotate(${this.state.pos.x * config.GAME.SPIN_FACTOR}deg)`   
                }}
                className="knob" id="left"
            />
            <div
                style={{
                     transform: `rotate(-${this.state.pos.y * config.GAME.SPIN_FACTOR}deg)`   
                }}
                className="knob" id="right"
            />
            </div>        
        )
    }

}

export default Board;
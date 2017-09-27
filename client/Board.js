import React, { Component } from 'react';
import config from '../config';

class Board extends Component {

    componentDidMount() {
        this.drawInitialBoard();

        console.log('attempting connection');
        const socket = io();

        this.bindSocketEvents(socket);
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
        diffs.forEach(function(diff) {
            this.drawPixel(diff.x, diff.y, diff.color);
        }, this);
    }

    drawPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect( x, y, config.GAME.PIXEL_SIZE, config.GAME.PIXEL_SIZE);
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
                    width: config.GAME.BOARD_BEZEL_THICKNESS * 2 + config.GAME.BOARD_WIDTH,
                    height: config.GAME.BOARD_BEZEL_THICKNESS * 2 + config.GAME.BOARD_HEIGHT
                }}
            >
            <div className="wrapper">
                    <canvas
                        className="sketch"    
                        style={{
                            background: config.GAME.BOARD_BG_COLOR
                        }}
                        ref={this.getCanvasRef.bind(this)}    
                        width={config.GAME.BOARD_WIDTH}
                        height={config.GAME.BOARD_HEIGHT}
                    >
                </canvas>
            </div>
            <div className="knob" id="left"></div>
            <div className="knob" id="right"></div>
            </div>        
        )
    }

}

export default Board;
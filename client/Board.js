import React, { Component } from 'react';
import config from '../config';
import Knob from './Knob';

const KEYCODES = {
    LEFT: '37',
    UP: '38',
    RIGHT: '39',
    DOWN: '40'
};

class Board extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pos: {
                x: null,
                y: null,
                color: null
            }
        };
    }

    componentDidMount() {
        this.drawInitialBoard();
        this.bindSocketEvents(this.props.socket);
    }

    componentWillReceiveProps(nextProps) {
        // draw onto canvas everytime theres changes
        if (nextProps.diffs !== this.props.diffs) {
            this.drawDiffs();
        }
    }

    bindSocketEvents(socket) {
        document.onkeydown = function (e) {
            console.log('down');
            e = e || window.event;

            if (e.keyCode == KEYCODES.UP) {
                socket.emit('move', { x: 0, y: -1 });
            } else if (e.keyCode == KEYCODES.DOWN) {
                socket.emit('move', { x: 0, y: 1 });
            } else if (e.keyCode == KEYCODES.LEFT) {
                socket.emit('move', { x: -1, y: 0 });
            } else if (e.keyCode == KEYCODES.RIGHT) {
                socket.emit('move', { x: 1, y: 0 });
            }
        };
    }

    drawDiffs() {
        this.props.diffs.forEach(function (diff) {
            // look for our id in the list of diffs
            // update out current position
            // draw black pixel on current pos
            if (diff.id === this.props.id) {
                this.updatePos(diff.x, diff.y, diff.color, diff.cursorColor);
            } else {
                this.drawPixel(diff.x, diff.y, diff.color);
            }
        }, this);
    }

    updatePos(x, y, color, cursorColor) {
        if (this.state.pos.x !== null && this.state.pos.y !== null) {
            this.drawPixel(
                this.state.pos.x,
                this.state.pos.y,
                color
            );
        }

        console.log(cursorColor);
        console.log(color);

        this.drawPixel(
            x,
            y,
            cursorColor
        );

        this.setState({
            pos: {
                x,
                y
            }
        });
    }

    drawPixel(x, y, color) {
        console.log('color: ' + color);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    }

    drawInitialBoard() {
        Object.keys(this.props.board).forEach((x) => {
            Object.keys(this.props.board[x]).forEach((y) => {
                this.drawPixel(x, y, this.props.board[x][y]);
            });
        });
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
                <Knob
                    id="left"
                    rotation={this.state.pos.x * config.GAME.SPIN_FACTOR}
                />
                <Knob
                    id="right"
                    rotation={-1 * this.state.pos.y * config.GAME.SPIN_FACTOR}
                />
            </div>
        );
    }
}

export default Board;

const Sequelize = require('sequelize');

class Board {
    constructor(DB) {
        this.model = DB.define('board_pixel', {
            x: {
                type: Sequelize.INTEGER,
                unique: 'compositeIndex'
            },
            y: {
                type: Sequelize.INTEGER,
                unique: 'compositeIndex'
            },
            color: {
                type: Sequelize.STRING
            }
        });
    }

    sync() {
        this.model.sync();
    }

    get() {
        return this.model.findAll()
            .then(pixels => pixels.map(pixel => pixel.get({ plain: true })))
            .then((pixels) => {
                const board = {};

                pixels.forEach((pixel) => {
                    if (!board[pixel.x]) {
                        board[pixel.x] = {};
                    }

                    board[pixel.x][pixel.y] = pixel.color;
                });

                return board;
            });
    }

    update(diffs) {
        const pixels = diffs.map(diff => ({
            color: diff.color,
            x: diff.x,
            y: diff.y
        }));

        return this.model.bulkCreate(pixels);
    }
}

module.exports = Board;

const Sequelize = require('sequelize');

class Board {
    constructor(DB) {
        this.model = DB.define('board', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            board: {
                type: Sequelize.JSON
            }
        });
    }

    sync() {
        this.model.sync();
    }

    get() {
        return this.model.find({
            where: {
                id: 'board'
            }
        }).then(board => board.get({ plain: true }).board);
    }

    update(board) {
        return this.model.upsert({
            id: 'board',
            board
        },
        {
            id: 'board'
        }
        ).catch(err => console.log(err.stack));
    }
}

module.exports = Board;

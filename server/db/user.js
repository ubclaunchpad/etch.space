const Sequelize = require('sequelize');

class User {
    constructor(DB) {
        this.model = DB.define('user', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            color: {
                type: Sequelize.STRING
            },
            cursorColor: {
                type: Sequelize.STRING
            },
            pos: {
                type: Sequelize.JSON
            },
            nextPos: {
                type: Sequelize.JSON
            },
            nick: {
                type: Sequelize.STRING
            },
            connected: {
                type: Sequelize.BOOLEAN
            }
        });
    }

    sync() {
        this.model.sync();
    }

    create(user) {
        return this.model.create(user);
    }

    getAll() {
        return this.model.findAll()
            .then(users => users.map(user => user.get({ plain: true })));
    }

    updateNick(id, nick) {
        return this.model.find({
            where: { id }
        })
            .then(user => user.updateAttributes({
                nick
            }));
    }
}

module.exports = User;

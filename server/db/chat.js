const Sequelize = require('sequelize');

class Chat {
    constructor(DB) {
        this.model = DB.define('chat_message', {
            userId: {
                type: Sequelize.STRING
            },
            content: {
                type: Sequelize.STRING
            },
            stamp: {
                type: Sequelize.INTEGER
            }
        });
    }

    sync() {
        this.model.sync();
    }

    create(message) {
        return this.model.create(message);
    }

    getAll() {
        return this.model.findAll()
            .then(messages => messages.map(message => message.get({ plain: true })));
    }
}

module.exports = Chat;

const Sequelize = require('sequelize');
const config = new Sequelize("foodie_app","root","password",{dialect: 'mariadb'});

const post = config.define('post', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    created_by_user_id: {
        type: Sequelize.STRING,
        foreignKey: true
    },
    item_name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    created_datetime: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    upload_date: {
        type: Sequelize.STRING,
        allowNull: false
    },
    location: {
        type: Sequelize.STRING,
        allowNull: false
    },
    image: {
        type: Sequelize.STRING,
        allowNull: true
    },


}, {timestamps: false});

module.exports = post;
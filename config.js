const Sequelize = require('sequelize');
const config = new Sequelize("foodie_app", "root","password",{dialect: 'mariadb'});

module.exports = config;

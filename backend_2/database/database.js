const Sequelize = require("sequelize");

const connection = new Sequelize('prototipo_grafos','root','sindy&12345',{
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-03:00'
});

module.exports = connection;
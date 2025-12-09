const Sequelize = require("sequelize");
const connection = require("../database/database");

const Movie = connection.define('movies',{
    title:{
        type: Sequelize.STRING,
        allowNull: false
    },gender: {
        type: Sequelize.STRING,
        allowNull: false
    },director: {
        type: Sequelize.STRING,
        allowNull: false
    },year: {
        type: Sequelize.INTEGER,
        allowNull: false
    },rating: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
});

Movie.sync({force: false});
module.exports = Movie;
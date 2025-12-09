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
    },
    cast: {
        type: Sequelize.TEXT, // Armazena string longa: "Tom Cruise, Miles Teller..."
        allowNull: true
    },
    tags: {
        type: Sequelize.TEXT, // Armazena: "avião, militar, rivalidade..."
        allowNull: true
    },
    poster_path: {
        type: Sequelize.STRING, // Armazena: "/8xV47NDrjdZDpkVcCFqkdHa3T0C.jpg"
        allowNull: true
    }
});

Movie.sync({force: false});
module.exports = Movie;
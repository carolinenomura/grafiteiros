const Sequelize = require("sequelize");
require('dotenv').config();

const connection = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    timezone: process.env.DB_TIMEZONE || '-03:00',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

module.exports = connection;
const Sqeuelize = require('sequelize');
const config = require("config")

const dbConfig = config.get('database')

const sequelize = new Sqeuelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: dbConfig.logging // we can stop loggers
});

module.exports = sequelize;

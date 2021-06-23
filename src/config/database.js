const Sqeuelize = require('sequelize');

const sequelize = new Sqeuelize('flyhigh', 'postgres', 'postgres', {
  dialect: 'sqlite',
  storage: './database.sqlite',
  // logging:false // we can stop loggers
});

module.exports = sequelize;

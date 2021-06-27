const Sequelize = require("sequelize");
const sequelize = require("../config/database");
const Model = Sequelize.Model;
class Token extends Model {}

Token.init(
  {
    token: {
      type: Sequelize.STRING,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
  },
  {
    sequelize,
    modelName: "token", //table name
  }
);

module.exports = Token;

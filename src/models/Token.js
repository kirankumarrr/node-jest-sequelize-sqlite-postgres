const Sequelize = require("sequelize");
const sequelize = require("../config/database");
const Model = Sequelize.Model;
class Token extends Model {}

Token.init(
  {
    token: {
      type: Sequelize.STRING,
    },
    lastUsedAt : {
      type: Sequelize.DATE,
    }
  },
  {
    sequelize,
    modelName: "token", //table name
    timestamps:false
  }
);

module.exports = Token;

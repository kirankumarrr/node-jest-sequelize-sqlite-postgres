const Sequelize = require("sequelize");
const sequelize = require("../config/database");
const Model = Sequelize.Model;
class User extends Model {}
const Token = require("./Token");
User.init(
  {
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
    },
    inactive: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    activationToken: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    modelName: "user", //table name
  }
);

User.hasMany(Token, { onDelete: "cascade", foreignKey: "userId" });

module.exports = User;

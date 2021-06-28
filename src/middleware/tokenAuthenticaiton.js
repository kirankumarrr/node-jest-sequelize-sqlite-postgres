const TokenService = require("../services/Token");
var colors = require('colors');
const bcrypt = require("bcrypt");
const UserService = require("../services/User");
const tokenAuthentication = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.substring(7);
    try {
      const user = await TokenService.verify(token);
      console.log(colors.black.bgGreen("User Token Created"));
      req.authenticatedUser = user;
    } catch (err) {
      console.log(colors.white.bgRed("TOKEN ERROR", err));
    }
  }
  next();
};

module.exports = tokenAuthentication;

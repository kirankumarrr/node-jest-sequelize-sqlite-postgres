const { validationResult } = require("express-validator");

const UserService = require("../services/User");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const UserAuthenticationFailedExcpection = require("../Errors/UserAuthenticationFailedExcpection");
const ForbiddenException = require("../Errors/ForbiddenException");
const TokenService = require("../services/Token");
/*
 * @desc : fetch users from database
 * @route : GET /api/1.0/users
 * @access : PUBLIC
 */
exports.authenticate = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new UserAuthenticationFailedExcpection());
  }

  const { email, password } = req.body;
  const user = await UserService.findByEmail(email);
  if (!user) {
    return next(new UserAuthenticationFailedExcpection());
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return next(new UserAuthenticationFailedExcpection());
  }
  if (user.inactive) {
    return next(new ForbiddenException());
  }

  const token = await TokenService.createToken(user);
  res.send({
    id: user.id,
    username: user.username,
    token,
  });
};

/*
 * @desc : delete token from database
 * @route : POST /api/1.0/auth/logout
 * @access : PUBLIC
 */
exports.authLogout = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.substring(7);
    await TokenService.deleteToken(token)
  }
  res.send()
};

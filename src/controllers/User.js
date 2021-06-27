const UserService = require("../services/User");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const ValidationExceptions = require("../Errors/ValidationExceptions");
const ForbiddenException = require("../Errors/ForbiddenException");

/*
 * @desc : Register user
 * @route : POST /api/1.0/users
 * @access : PUBLIC
 */
exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationExceptions(errors.array()));
  }
  try {
    await UserService.save(req.body);
    return res.send({ message: req.t("user_create_success") });
  } catch (err) {
    next(err);
    // return res.status(502).send({ message:req.t(err.message) })
  }
};

/*
 * @desc : Activate User when token is sent
 * @route : POST /api/1.0/users/token/:token
 * @access : PUBLIC
 */
exports.registerActivationToken = async (req, res, next) => {
  const { token } = req.params;
  try {
    await UserService.activate(token);
    res.send({ message: req.t("account_activation_success") });
  } catch (err) {
    // res.status(400).send({message:req.t(err.message)})
    next(err);
  }
};

/*
 * @desc : fetch users from database
 * @route : GET /api/1.0/users
 * @access : PUBLIC
 */
exports.getUserLisiting = async (req, res, next) => {
  const authenticatedUser = req.authenticatedUser;
  const { page, size } = req.pagination;
  const users = await UserService.getUsers({ page, size, authenticatedUser });
  res.send(users);
};

/*
 * @desc : fetch users from database
 * @route : GET /api/1.0/users
 * @access : PUBLIC
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await UserService.fetchUser(req.params.id);
    res.send(user);
  } catch (err) {
    next(err);
  }
};
/*
 * @desc : fetch users from database
 * @route : GET /api/1.0/users
 * @access : PUBLIC
 */
exports.updateUser = async (req, res, next) => {
  const authenticatedUser = req.authenticatedUser;

  if (
    (req.params.id !== undefined && !authenticatedUser) ||
    authenticatedUser.id !== parseInt(req.params.id)
  ) {
    return next(new ForbiddenException("unauthroized_user_update"));
  }
  await UserService.updateUser(req.params.id, req.body);

  return res.send({ message: "User Updated successfully" });
};

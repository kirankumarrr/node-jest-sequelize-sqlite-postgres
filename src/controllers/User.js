const UserService = require("../services/User");

/*
 * @desc : Register user
 * @route : POST /api/v1/auth/register
 * @access : PUBLIC
 */
exports.register = async (req, res) => {
  await UserService.save(req.body);
  return res.send({ message: "User created" });
};

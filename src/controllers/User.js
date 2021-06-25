const UserService = require("../services/User");
const { validationResult } = require("express-validator");


/*
 * @desc : Register user
 * @route : POST /api/v1/auth/register
 * @access : PUBLIC
 */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const validationErrors = {}
    errors.array().forEach(error => {
      validationErrors[error.param] = error.msg
    });
    return res.status(400).send({validationErrors})
  }
  try{
    await UserService.save(req.body);
    return res.send({ message: "User created" });
  }catch(err){
    return res.send({ validationErrors: {email:'E-mail in use'} });
  }
};

const UserService = require("../services/User");
const { validationResult } = require("express-validator");
const User = require("../models/User");


/*
 * @desc : Register user
 * @route : POST /api/1.0/users
 * @access : PUBLIC
 */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const validationErrors = {}
    errors.array().forEach(error => {
      validationErrors[error.param] = req.t(error.msg)
    });
    return res.status(400).send({validationErrors})
  }
 try{
  await UserService.save(req.body);
  return res.send({ message:req.t('user_create_success') });
 }catch(err){
  return res.status(502).send({ message:req.t(err.message) })
 }
};



/*
 * @desc : Activate User when token is sent
 * @route : POST /api/1.0/users/token/:token
 * @access : PUBLIC
 */
exports.registerActivationToken = async (req, res) => {
  const { token } = req.params;
  try{
    await UserService.activate(token);
    res.send({message:req.t('account_activation_success')})
  }catch(err){
    res.status(400).send({message:req.t(err.message)})
  }
};

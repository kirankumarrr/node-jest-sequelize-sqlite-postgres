const { check } = require("express-validator");
const UserService = require("../services/User");

const username = check("username")
  .notEmpty()
  .withMessage('username_null')
  .bail()
  .isLength({ min: 4, max: 32 })
  .withMessage('username_size');

const email = check('email')
  .notEmpty()
  .withMessage('email_null')
  .bail()
  .isEmail()
  .withMessage('email_invalid')
  .bail()
  .custom(async (email) => {
    const user = await UserService.findByEmail(email);
    if (user) {
      throw new Error('email_inuse');
    }
  });

const password = check("password")
  .notEmpty()
  .withMessage('password_null')
  .bail()
  .isLength({ min: 6 })
  .withMessage('password_size')
  .bail()
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
  .withMessage('password_pattern');

exports.registerValidator = () => [username, email, password];

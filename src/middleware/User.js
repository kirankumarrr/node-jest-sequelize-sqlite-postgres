const { check } = require("express-validator");
const UserService = require("../services/User");

const username = check("username")
  .notEmpty()
  .withMessage("Username cannot be null")
  .bail()
  .isLength({ min: 4, max: 32 })
  .withMessage("Must have min 4 and max 32 characters");

const email = check("email")
  .notEmpty()
  .withMessage("Email cannot be null")
  .bail()
  .isEmail()
  .withMessage("Email is not valid")
  .bail()
  .custom(async (email) => {
    const user = await UserService.findByEmail(email);
    if (user) {
      throw new Error("E-mail in use");
    }
  });

const password = check("password")
  .notEmpty()
  .withMessage("Password cannot be null")
  .bail()
  .isLength({ min: 6 })
  .withMessage("Password must be atleast 6 characters")
  .bail()
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
  .withMessage(
    "Password must be atleast 1 uppercase, 1 lowercase and 1 number as characters"
  );

exports.registerValidator = () => [username, email, password];

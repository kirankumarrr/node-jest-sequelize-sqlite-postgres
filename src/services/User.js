const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const EmailService = require("./Email");
const sequelize = require("../config/database");
const EmailException = require("../Errors/Email");
const InvalidTokenException = require("../Errors/UserInvalidTokenException");
const UserNotFoundExpection = require("../Errors/UserNotFoundExpection");
const generateToken = (length) => {
  return crypto.randomBytes(16).toString("hex").substring(0, length);
};

const save = async (body) => {
  const { username, email, password } = body;

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const user = {
    username,
    email,
    password,
    password: hashedPassword,
    activationToken: generateToken(16),
  };

  //why ?
  const transaction = await sequelize.transaction();

  await User.create(user, { transaction });
  try {
    await EmailService.sendAccountActivation(email, user.activationToken);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw new EmailException();
  }
};

const findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

const activate = async (token) => {
  const user = await User.findOne({ where: { activationToken: token } });
  if (!user) {
    throw new InvalidTokenException();
  }
  user.inactive = false;
  user.activationToken = null;
  await user.save();
};

const getUsers = async ({page=0,size=10}={}) => {
  const usersWithCount = await User.findAndCountAll({
    where: { inactive: false },
    attributes: ["id", "username", "email"],
    limit: size,
    offset: page * size
  });

  // DRY
  // const count = await User.count({ where: { inactive: false } });

  return {
    content: usersWithCount.rows,
    page,
    size,
    totalPage: Math.ceil(usersWithCount.count/size),
  };
};

const fetchUser = async(id)=>{
  const user = await User.findOne({where: { id,inactive:false },attributes:['id','username','email']})
  if(!user){
    throw new UserNotFoundExpection() 
  }
  return user
}

module.exports = { save, findByEmail, activate, getUsers,fetchUser };

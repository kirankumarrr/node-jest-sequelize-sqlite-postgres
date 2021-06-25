const User = require("../models/User");
const bcrypt = require("bcrypt");

const save = async (body) => {
  const hashedPassword = await bcrypt.hash(body.password, 10);

  const user = { ...body, password: hashedPassword };

  await User.create(user);
};


const findByEmail = async(email)=>{
  return await User.findOne({where:{email}})
}

module.exports = { save, findByEmail };

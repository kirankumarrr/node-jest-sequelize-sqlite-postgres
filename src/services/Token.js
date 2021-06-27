// const jwt = require("jsonwebtoken");
const Token = require("../models/Token");
const { randomString } = require("../shared/generator");
const createToken = async (user) => {
  const token = randomString(32);
  await Token.create({
    token,
    userId: user.id,
  });
  return token;
  // return jwt.sign({ id: user.id }, "secret-flyhigh", {expiresIn:'1d'});
};

const verify = async (token) => {
  const tokenInDb = await Token.findOne({
    where: {
      token,
    },
  });
  // return jwt.verify(token, "secret-flyhigh");
  const userId = tokenInDb.userId;
  return { id: userId };
};

module.exports = {
  createToken,
  verify,
};

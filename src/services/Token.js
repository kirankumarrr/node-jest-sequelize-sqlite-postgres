const Sequelize = require("sequelize");
const Token = require("../models/Token");
var colors = require('colors');
const timeUtils = require("../Utils/time");

const { randomString } = require("../shared/generator");
const createToken = async (user) => {
  const token = randomString(32);
  await Token.create({
    token,
    userId: user.id,
    lastUsedAt: new Date(),
  });
  return token;
  // return jwt.sign({ id: user.id }, "secret-flyhigh", {expiresIn:'1d'});
};

const verify = async (token) => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 - 1);

  const tokenInDb = await Token.findOne({
    where: {
      token,
      lastUsedAt: {
        [Sequelize.Op.gt]: oneWeekAgo,
      },
    },
  });
  // return jwt.verify(token, "secret-flyhigh");

  tokenInDb.lastUsedAt = new Date();
  tokenInDb.save();
  const userId = tokenInDb.userId;
  return { id: userId };
};

const deleteToken = async (token) => {
  await Token.destroy({ where: { token } });
};

const scheduleCleanup = () => {
  setInterval(async () => {
    console.log(colors.black.bgGreen("Running schedule Token Cleanup "));
    await Token.destroy({
      where: {
        lastUsedAt: {
          [Sequelize.Op.lt]: timeUtils.oneWeekAgo,
        },
      },
    });
  }, 60*60*1000);
};

module.exports = {
  createToken,
  verify,
  deleteToken,
  scheduleCleanup,
};

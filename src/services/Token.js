const jwt = require("jsonwebtoken");
const createToken = async (user) => {
  return jwt.sign({ id: user.id }, "secret-flyhigh", {expiresIn:'1d'});
};

const verify = async (token) => {
  return jwt.verify(token, "secret-flyhigh");
};

module.exports = {
  createToken,
  verify,
};

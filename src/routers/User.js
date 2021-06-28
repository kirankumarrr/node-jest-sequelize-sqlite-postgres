const express = require("express");
const router = express.Router();
const {
  register,
  registerActivationToken,
  getUserLisiting,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/User");
// const basicAuthentication = require("../middleware/basicAuthentication");
const { pagination } = require("../middleware/Pagination");
// const tokenAuthentication = require("../middleware/tokenAuthenticaiton");
const { registerValidator } = require("../middleware/User");

router.post("/1.0/users", registerValidator(), register);
router.get("/1.0/users", pagination, getUserLisiting);
router.get("/1.0/users/:id", getUser);
router.put("/1.0/users/:id", updateUser);
router.post("/1.0/users/token/:token", registerActivationToken);

router.delete("/1.0/users/:id", deleteUser);

module.exports = router;

const express = require("express");
const router = express.Router();
const { register, registerActivationToken, getUserLisiting, getUser, updateUser } = require("../controllers/User");
const basicAuthentication = require("../middleware/basicAuthentication");
const { pagination } = require("../middleware/Pagination");
const { registerValidator } = require("../middleware/User");

router.post("/1.0/users", registerValidator(), register);
router.get("/1.0/users", pagination,basicAuthentication, getUserLisiting);
router.get("/1.0/users/:id", getUser);
router.put("/1.0/users/:id", basicAuthentication , updateUser);
router.post("/1.0/users/token/:token", registerActivationToken);

module.exports = router;

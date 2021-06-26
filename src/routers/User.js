const express = require("express");
const router = express.Router();
const { register, registerActivationToken, getUserLisiting, getUser } = require("../controllers/User");
const { pagination } = require("../middleware/Pagination");
const { registerValidator } = require("../middleware/User");

router.post("/1.0/users", registerValidator(), register);
router.get("/1.0/users", pagination, getUserLisiting);
router.get("/1.0/users/:id", getUser);
router.post("/1.0/users/token/:token", registerActivationToken);

module.exports = router;

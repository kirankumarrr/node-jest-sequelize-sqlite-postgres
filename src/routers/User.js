const express = require("express");
const router = express.Router();
const { register, registerActivationToken, getUserLisiting } = require("../controllers/User");
const { registerValidator } = require("../middleware/User");

router.post("/1.0/users", registerValidator(), register);
router.get("/1.0/users", getUserLisiting);

router.post("/1.0/users/token/:token", registerActivationToken);

module.exports = router;

const express = require("express");
const router = express.Router();
const { register } = require("../controllers/User");
const { registerValidator } = require("../middleware/User");

router.post("/1.0/users", registerValidator(), register);

module.exports = router;

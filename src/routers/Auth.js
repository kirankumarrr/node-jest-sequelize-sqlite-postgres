const express = require("express");
const { authenticate } = require("../controllers/Auth");
const router = express.Router();
const { authLoginValidator } = require("../middleware/User");
router.post("/1.0/auth", authLoginValidator(), authenticate);

module.exports = router;

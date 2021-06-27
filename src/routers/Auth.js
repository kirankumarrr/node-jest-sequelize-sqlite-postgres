const express = require("express");
const { authenticate, authLogout } = require("../controllers/Auth");
const router = express.Router();
const { authLoginValidator } = require("../middleware/User");

router.post("/1.0/auth", authLoginValidator(), authenticate);

router.post("/1.0/auth/logout", authLogout);

module.exports = router;

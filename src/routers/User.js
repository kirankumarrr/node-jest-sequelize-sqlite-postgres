const express = require('express');
const router = express.Router()

const { register } = require('../controllers/User')

router.post('/1.0/users', register);

module.exports = router
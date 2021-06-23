const express = require('express');
const UserRouter = require('./routers/User')
const app = express();

app.use(express.json())

app.use('/api', UserRouter)

module.exports = app;

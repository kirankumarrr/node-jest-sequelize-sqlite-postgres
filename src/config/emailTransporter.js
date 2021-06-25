const nodemailer = require("nodemailer");
const config = require('config')
const mailConfig = config.get('mail')

// const nodemailerStub = require("nodemailer-stub");

// const transporter = nodemailer.createTransport(nodemailerStub.stubTransport);
const transporter = nodemailer.createTransport({...mailConfig});

module.exports = { transporter }
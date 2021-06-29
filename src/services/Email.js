const nodemailer = require("nodemailer");
const { transporter } = require("../config/emailTransporter");
const logger = require("../shared/logger");

const sendAccountActivation = async (email, token) => {
  const info = await transporter.sendMail({
    from: "My Flyhigh <infoFlyhigh@app.com>",
    to: email,
    subject: "Account Activation From Flyhigh",
    html: `
    <div>
      <b> Please click below link to activate your account</b>    
    </div>
    <div>
      <a href="http://localhost:3000/api/1.0/users/token?token=${token}">Activate</a>   
    </div>
    `,
  });

  if(process.env.NODE_ENV==='development'){
    logger.info(`url: ${nodemailer.getTestMessageUrl(info)}`);  
  }

};

//Token is ${token}

module.exports = { sendAccountActivation };

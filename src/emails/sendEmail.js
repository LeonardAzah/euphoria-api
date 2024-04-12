const nodemailer = require("nodemailer");
const nodemailerConfig = require("../config/nodemailerConfig");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail({
    from: '"Euphoria" <euphoria@euphoria.com>',
    to: to,
    subject: subject,
    html: html,
  });
};

module.exports = sendEmail;

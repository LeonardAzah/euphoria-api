const verifyEmail = require("./mailTemplate");
const sendEmail = require("./sendEmail");

const sendAdminEmail = async ({ name, email, otp }) => {
  const message =
    "Your vendors account has been created at Euphoria  log in with";
  const emailTemplate = verifyEmail(otp, name, message);

  await sendEmail({
    to: email,
    subject: "Euphoria vendor's account",
    html: emailTemplate.txt,
  });
};

module.exports = sendAdminEmail;

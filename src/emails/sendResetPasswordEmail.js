const sendEmail = require("./sendEmail");
const verifyEmail = require("./mailTemplate");

const sendResetPasswordEmail = async ({ name, email, otp }) => {
  const message =
    "A request to change your Euphoria account password was received.Use the code below to confirm.";

  const emailTemplate = verifyEmail(otp, name, message);

  await sendEmail({
    to: email,
    subject: "Reset password",
    html: emailTemplate.html,
  });
};

module.exports = sendResetPasswordEmail;

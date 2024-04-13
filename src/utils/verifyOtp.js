const bcrypt = require("bcryptjs");

const verifyOTP = async (providedOTP, user) => {
  const isOTPValid = await bcrypt.compare(providedOTP, user.passwordOtp);

  // Check if OTP is valid and not expired
  const currentDate = new Date();
  if (
    isOTPValid &&
    user.passwordTokenExpirationDate &&
    user.passwordTokenExpirationDate > currentDate
  ) {
    return true;
  }

  return false;
};

module.exports = verifyOTP;

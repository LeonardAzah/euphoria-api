const User = require("../models/User");
const Token = require("../models/Token");
const asyncHandler = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const createTokenUser = require("../utils/createTokenUser");
const { attachCookiesToResponse } = require("../utils/jwt");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");
const CustomError = require("../errors");
const createHash = require("../utils/createHash");
const bcrypt = require("bcryptjs");
const sendResetPasswordEmail = require("../emails/sendResetPasswordEmail");
const verifyOTP = require("../utils/verifyOtp");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const tokenUser = createTokenUser(user);

  //create refresh token
  let refreshToken = "";

  //check for existing tokens
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }
  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };
  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
});

const logout = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  await Token.findOneAndDelete({ user: userId });
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.NotFoundError("We can not find your email");
  }

  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const tenMinutes = 1000 * 60 * 10;
  const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

  user.passwordOtp = await createHash(otp);
  user.passwordTokenExpirationDate = passwordTokenExpirationDate;
  await user.save();

  await sendResetPasswordEmail({
    name: user.name,
    email: user.email,
    otp: otp,
  });
  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email for reset password code" });
});

const verifyCode = asyncHandler(async (req, res) => {
  const { code, email } = req.body;
  const user = await User.findOne({ email });

  const isValid = await verifyOTP(code, user);
  if (!isValid) {
    throw new CustomError.UnauthenticatedError("Verification Failed");
  }

  user.passwordOtp = null;
  user.passwordTokenExpirationDate = null;
  await user.save();

  res.status(StatusCodes.OK).json({ success: true, msg: "verified" });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.NotFoundError("We can not find your email");
  }
  user.password = password;
  await user.save();

  res.status(StatusCodes.OK).json({ success: true, msg: "Password Resetted!" });
});

const callback = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  const tokenUser = createTokenUser(user);

  //create refresh token
  let refreshToken = "";

  //check for existing tokens
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }
  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };
  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
});

module.exports = {
  login,
  logout,
  resetPassword,
  verifyCode,
  forgotPassword,
  callback,
};

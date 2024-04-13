const express = require("express");
const authController = require("../controllers/auth.controller");
const { authenticateUser } = require("../middleware/authentication");
const passport = require("passport");
const validateRequest = require("../middleware/requestvalidator");
const {
  loginValidation,
  forgotPasswordValidation,
  verifyCodeValidation,
  resetPasswordValidation,
} = require("../validators/auth.validate");

const router = express.Router();

router.post("/login", validateRequest(loginValidation), authController.login);

router.delete("/logout", authenticateUser, authController.logout);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordValidation),
  authController.forgotPassword
);
router.post(
  "/verify",
  validateRequest(verifyCodeValidation),
  authController.verifyCode
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordValidation),
  authController.resetPassword
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.callback
);

router.get(
  "/twitter",
  passport.authenticate("twitter", {
    scope: ["tweet.read", "users.read"],
  })
);

router.get(
  "/twitter/callback",
  passport.authenticate("twitter"),
  authController.callback
);

module.exports = router;

const express = require("express");
const authController = require("../controllers/auth.controller");
const { authenticateUser } = require("../middleware/authentication");
const passport = require("passport");

const router = express.Router();

router.post("/login", authController.login);
router.delete("/logout", authenticateUser, authController.logout);

router.post("/forgot-password", authController.forgotPassword);
router.post("/verify", authController.verifyCode);

router.post("/reset-password", authController.resetPassword);

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

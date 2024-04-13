const { body } = require("express-validator");

const comparePasswords = (value, { req }) => {
  if (value !== req.body.confirmPassword) {
    throw new CustomError.BadRequestError("Password  do not match");
  }
  return true;
};
const loginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Invalid email"),
];

const verifyCodeValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("code")
    .notEmpty()
    .withMessage("Code is required")
    .isLength({ min: 4, max: 4 })
    .withMessage("Code must be 4 characters long"),
];

const resetPasswordValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom(comparePasswords),
];

module.exports = {
  loginValidation,
  forgotPasswordValidation,
  verifyCodeValidation,
  resetPasswordValidation,
};

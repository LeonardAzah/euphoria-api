const { body } = require("express-validator");
const validatePassword = require("./validatePassword");

const registerUserValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").custom(validatePassword),
];
const registerAdminValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("name").notEmpty().trim().withMessage("Name is required"),
];

const updateUserValidation = [
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters"),
  body("phone")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Phone number must be at least 8 characters long"),
  body("password")
    .optional()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

module.exports = {
  registerUserValidation,
  registerAdminValidation,
  updateUserValidation,
};

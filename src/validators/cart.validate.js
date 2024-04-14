const { body } = require("express-validator");
const CustomError = require("../errors");

const validateNumber = (value) => {
  if (!Number.isInteger(value)) {
    throw new CustomError.BadRequestError("Invalid number");
  }
  return true;
};

const cartValidation = [
  body("color").trim().notEmpty().withMessage("Color is required"),
  body("size")
    .trim()
    .notEmpty()
    .withMessage("Size is required")
    .isIn(["xxs", "xl", "xs", "s", "m", "l", "xxl", "3xl", "4xl"])
    .withMessage("Invalid size"),
  body("quantity")
    .custom(validateNumber)
    .withMessage("Quantity must be a valid number")
    .toInt()
    .isInt({ allow_leading_zeroes: false })
    .withMessage("Quantity must be an integer")
    .exists()
    .withMessage("Quantity is required"),
];

const removeCardValidation = [
  body("color").trim().notEmpty().withMessage("Color is required"),
  body("size")
    .trim()
    .notEmpty()
    .withMessage("Size is required")
    .isIn(["xxs", "xl", "xs", "s", "m", "l", "xxl", "3xl", "4xl"])
    .withMessage("Invalid size"),
];

module.exports = {
  cartValidation,
  removeCardValidation,
};

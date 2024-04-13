const { body, param } = require("express-validator");

const addressValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("country").trim().notEmpty().withMessage("Country is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("postalCode").trim().notEmpty().withMessage("Postal code is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("streetAddress")
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),
  body("addressType")
    .trim()
    .optional()
    .isIn(["billing", "shipping"])
    .withMessage("Invalid address type"),
  body("defaultAddress")
    .optional()
    .isBoolean()
    .withMessage("Invalid default address value"),
];
const updateAddressValidation = [
  param("id").isMongoId().withMessage("Invalid product ID"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("country").trim().notEmpty().withMessage("Country is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("postalCode").trim().notEmpty().withMessage("Postal code is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("streetAddress")
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),
  body("addressType")
    .trim()
    .optional()
    .isIn(["billing", "shipping"])
    .withMessage("Invalid address type"),
  body("defaultAddress")
    .optional()
    .isBoolean()
    .withMessage("Invalid default address value"),
];

module.exports = {
  addressValidation,
  updateAddressValidation,
};

const express = require("express");
const productController = require("../controllers/product.controller");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const validateRequest = require("../middleware/requestvalidator");
const validateId = require("../validators/Id.validate");
const {
  cartValidation,
  removeCardValidation,
} = require("../validators/cart.validate");

const router = express.Router();

router.post(
  "/:id",
  authenticateUser,
  validateRequest(validateId),
  validateRequest(cartValidation),
  authorizePermissions("user"),
  productController.addProductToCart
);
router.get(
  "/",
  authenticateUser,
  authorizePermissions("user"),
  productController.getCart
);

router.patch(
  "/:id",
  authenticateUser,
  validateRequest(validateId),
  validateRequest(removeCardValidation),
  authorizePermissions("user"),
  productController.removeProductFromCart
);

module.exports = router;

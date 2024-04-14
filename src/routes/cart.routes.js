const express = require("express");
const productController = require("../controllers/product.controller");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const validateRequest = require("../middleware/requestvalidator");
const validateId = require("../validators/Id.validate");

const router = express.Router();

router.post(
  "/:id",
  authenticateUser,
  validateRequest(validateId),
  authorizePermissions("user"),
  productController.addProductToCart
);
router.get(
  "/",
  authenticateUser,
  authorizePermissions("user"),
  productController.getCart
);

router.delete(
  "/:id",
  authenticateUser,
  authorizePermissions("user"),
  productController.removeProductFromCart
);

module.exports = router;

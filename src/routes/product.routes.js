const express = require("express");
const productController = require("../controllers/product.controller");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const validateRequest = require("../middleware/requestvalidator");
const { productValidation } = require("../validators/product.validate");
const validateId = require("../validators/Id.validate");

const router = express.Router();

router.post(
  "/",
  validateRequest(productValidation),
  authenticateUser,
  authorizePermissions("admin"),
  productController.createProduct
);
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/category", productController.getProductByCategory);
router.get(
  "/all",
  authenticateUser,
  authorizePermissions("admin"),
  productController.getAllMyProducts
);

router.put(
  "/:id",
  validateRequest(validateId),
  validateRequest(productValidation),
  authenticateUser,
  authorizePermissions("admin"),
  productController.updateProduct
);

router.delete(
  "/:id",
  validateRequest(validateId),
  authenticateUser,
  authorizePermissions("admin"),
  productController.deleteProduct
);

router.get(
  "/:id",
  validateRequest(validateId),
  productController.getProductById
);
module.exports = router;

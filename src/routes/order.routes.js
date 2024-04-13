const express = require("express");
const productController = require("../controllers/product.controller");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  authorizePermissions("user"),
  productController.makeCheckout
);
router.get("/", authenticateUser, productController.getAllOrder);

router.get("/:id", authenticateUser, productController.getOrderById);

module.exports = router;

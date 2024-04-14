const express = require("express");
const addressController = require("../controllers/adress.controller");
const { authenticateUser } = require("../middleware/authentication");
const validateRequest = require("../middleware/requestvalidator");
const {
  addressValidation,
  updateAddressValidation,
} = require("../validators/address.validate");
const validateId = require("../validators/Id.validate");

const router = express.Router();

router.post(
  "/",
  validateRequest(addressValidation),
  authenticateUser,
  addressController.createAddress
);
router.get("/", authenticateUser, addressController.getAllAddresses);

router.put(
  "/:id",
  validateRequest(validateId),
  validateRequest(addressValidation),
  authenticateUser,
  addressController.updateAddress
);

router.delete(
  "/:id",
  validateRequest(validateId),
  authenticateUser,
  addressController.deleteAddress
);

router.patch(
  "/:id",
  validateRequest(validateId),
  authenticateUser,
  addressController.defaultAddress
);

router.get(
  "/:id",
  validateRequest(validateId),
  authenticateUser,
  addressController.getAddressById
);

module.exports = router;

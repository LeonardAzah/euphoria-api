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
  "/billings",
  validateRequest(addressValidation),
  authenticateUser,
  addressController.createBillingAddress
);
router.post(
  "/shipping",
  validateRequest(addressValidation),
  authenticateUser,
  addressController.createBillingAddress
);
router.get("/", authenticateUser, addressController.getAllAddresses);

router.put(
  "/:id",
  validateRequest(validateId),

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
  validateRequest(updateAddressValidation),
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

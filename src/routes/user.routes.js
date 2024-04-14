const express = require("express");
const userController = require("../controllers/user.controller");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const validateRequest = require("../middleware/requestvalidator");
const {
  registerAdminValidation,
  registerUserValidation,
  updateUserValidation,
} = require("../validators/user.validate");
const validateId = require("../validators/Id.validate");

const router = express.Router();
router.post(
  "/admin",
  validateRequest(registerAdminValidation),
  userController.registerAdmin
);

router.post(
  "/",
  validateRequest(registerUserValidation),
  userController.registerUser
);
router.get("/me", authenticateUser, userController.getCurrentUser);
router.get(
  "/",
  authenticateUser,
  authorizePermissions("admin"),
  userController.getAllUser
);
router.patch(
  "/",
  validateRequest(updateUserValidation),
  authenticateUser,
  userController.updateUser
);
router.delete(
  "/:id",
  validateRequest(validateId),
  authenticateUser,
  authorizePermissions("admin"),
  userController.deleteUser
);
router.get(
  "/:id",
  validateRequest(validateId),
  authenticateUser,
  userController.getUserById
);

module.exports = router;

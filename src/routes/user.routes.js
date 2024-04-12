const express = require("express");
const userController = require("../controllers/user.controller");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const router = express.Router();

router.post("/", userController.registerUser);
router.get("/me", authenticateUser, userController.getCurrentUser);
router.get(
  "/",
  authenticateUser,
  authorizePermissions("admin"),
  userController.getAllUser
);
router.patch(
  "/:id",
  authenticateUser,
  authorizePermissions("admin"),
  userController.updateUser
);
router.delete(
  "/:id",
  authenticateUser,
  authorizePermissions("admin"),
  userController.deleteUser
);
router.get(
  "/:id",
  authenticateUser,
  authorizePermissions("admin", "user"),
  userController.getUserById
);

module.exports = router;

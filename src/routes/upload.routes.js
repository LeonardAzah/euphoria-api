const express = require("express");
const uploadController = require("../controllers/imageUpload.controller");
const uploads = require("../config/multer");
const { authenticateUser } = require("../middleware/authentication");

const router = express.Router();

router.post(
  "/",
  uploads.single("image"),
  authenticateUser,
  uploadController.uploadImage
);

module.exports = router;

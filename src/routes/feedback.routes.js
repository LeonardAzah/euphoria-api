const express = require("express");
const feedbackController = require("../controllers/feedback.controller");
const { authenticateUser } = require("../middleware/authentication");
const validateRequest = require("../middleware/requestvalidator");
const validateId = require("../validators/Id.validate");
const validateFeedback = require("../validators/feedback.validate");

const router = express.Router();

router.post(
  "/:id",
  validateRequest(validateId),
  validateRequest(validateFeedback),
  authenticateUser,
  feedbackController.creatFeedback
);

router.get("/", feedbackController.getAllFeedback);
router.get(
  "/on-product/:id",
  authenticateUser,
  feedbackController.getMyFeedback
);

router.get(
  "/product/:id",
  validateRequest(validateId),
  feedbackController.getProductFeedbacks
);

router.put(
  "/:id",
  validateRequest(validateId),
  validateRequest(validateFeedback),
  authenticateUser,
  feedbackController.updateFeedback
);

router.delete(
  "/:id",
  validateRequest(validateId),
  authenticateUser,
  feedbackController.deleteFeedback
);

router.get(
  "/:id",
  validateRequest(validateId),
  authenticateUser,
  feedbackController.getFeedbackById
);

module.exports = router;

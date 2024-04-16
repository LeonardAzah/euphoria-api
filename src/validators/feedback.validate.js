const { body } = require("express-validator");

const validateFeedback = [
  body("rating")
    .exists()
    .withMessage("Rating is required")
    .isFloat()
    .withMessage("Rating must be an integer")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .exists()
    .withMessage("Comment is required")
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),
];

module.exports = validateFeedback;

const { param } = require("express-validator");
const validateId = [param("id").isMongoId().withMessage("Invalid product ID")];

module.exports = validateId;

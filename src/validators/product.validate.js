const { body, param } = require("express-validator");

const productValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("category").isArray({ min: 1 }).withMessage("Category is required"),
  body("category.*")
    .isIn(["men", "women", "combos", "joggers"])
    .withMessage("Invalid category"),
  body("type").trim().notEmpty().withMessage("Type is required"),
  body("description").isObject().withMessage("Description is required"),
  body("description.context")
    .trim()
    .notEmpty()
    .withMessage("Context is required"),
  body("description.fabric")
    .trim()
    .notEmpty()
    .withMessage("Fabric is required"),
  body("description.neck").trim().notEmpty().withMessage("Neck is required"),
  body("description.pattern")
    .trim()
    .notEmpty()
    .withMessage("Pattern is required"),
  body("description.fit").trim().notEmpty().withMessage("Fit is required"),
  body("description.style").trim().notEmpty().withMessage("Style is required"),
  body("description.sleeve")
    .trim()
    .notEmpty()
    .withMessage("Sleeve is required"),
  body("imageUrl").trim().notEmpty().withMessage("Image URL is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("shipping").isNumeric().withMessage("Shipping must be a number"),
  body("colors")
    .isArray({ min: 1 })
    .withMessage("At least one color is required"),
  body("sizes")
    .isArray({ min: 1 })
    .withMessage("At least one size is required"),
  body("sizes.*")
    .isIn(["xxs", "xl", "xs", "s", "m", "l", "xxl", "3xl", "4xl"])
    .withMessage("Invalid size"),
  body("dressStyles")
    .optional()
    .isArray()
    .withMessage("Dress styles must be an array"),
  body("dressStyles.*")
    .optional()
    .isIn(["classic", "casual", "business", "sport", "formal"])
    .withMessage("Invalid dress style"),
];
const productUpdateValidation = [
  param("id").isMongoId().withMessage("Invalid product ID"),
  body("name").optional().trim().notEmpty().withMessage("Name is required"),
  body("category")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Category is required"),
  body("category.*")
    .optional()
    .isIn(["men", "women", "combos", "joggers"])
    .withMessage("Invalid category"),
  body("type").optional().trim().notEmpty().withMessage("Type is required"),
  body("description")
    .optional()
    .isObject()
    .withMessage("Description is required"),
  body("description.context")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Context is required"),
  body("description.fabric")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Fabric is required"),
  body("description.neck")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Neck is required"),
  body("description.pattern")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Pattern is required"),
  body("description.fit")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Fit is required"),
  body("description.style")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Style is required"),
  body("description.sleeve")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Sleeve is required"),
  body("imageUrl")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Image URL is required"),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
  body("shipping")
    .optional()
    .isNumeric()
    .withMessage("Shipping must be a number"),
  body("colors")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one color is required"),
  body("sizes")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one size is required"),
  body("sizes.*")
    .optional()
    .isIn(["xxs", "xl", "xs", "s", "m", "l", "xxl", "3xl", "4xl"])
    .withMessage("Invalid size"),
  body("dressStyles")
    .optional()
    .isArray()
    .withMessage("Dress styles must be an array"),
  body("dressStyles.*")
    .optional()
    .isIn(["classic", "casual", "business", "sport", "formal"])
    .withMessage("Invalid dress style"),
];

module.exports = {
  productValidation,
  productUpdateValidation,
};

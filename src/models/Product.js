const mongoose = require("mongoose");

const descriptionSchema = new mongoose.Schema({
  context: {
    type: String,
    required: true,
  },
  fabric: {
    type: String,
    required: true,
  },
  neck: {
    type: String,
    required: true,
  },
  pattern: {
    type: String,
    required: true,
  },
  fit: {
    type: String,
    required: true,
  },
  style: {
    type: String,
    required: true,
  },
  sleeve: {
    type: String,
    required: true,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: [String],
      required: true,
      enum: ["men", "women", "combos", "joggers"],
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: descriptionSchema,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    colors: {
      type: [String],
      required: true,
    },
    sizes: {
      type: [String],
      required: true,
      enum: ["xxs", "xl", "xs", "s", "m", "l", "xxl", "3xl", "4xl"],
    },
    dressStyles: {
      type: [String],
      enum: ["classic", "casual", "business", "sport", "formal"],
    },
    creator: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

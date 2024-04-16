const mongoose = require("mongoose");

const DescriptionSchema = new mongoose.Schema({
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
  },
  pattern: {
    type: String,
  },
  fit: {
    type: String,
    required: true,
  },
  style: {
    type: String,
  },
  sleeve: {
    type: String,
  },
});

const ProductSchema = new mongoose.Schema(
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
      type: DescriptionSchema,
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
      default: "formal",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfFeedbacks: {
      type: Number,
      default: 0,
    },
    creator: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("feedback", {
  ref: "Feedback",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

ProductSchema.pre("remove", async function (next) {
  await this.model("Feedback").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);

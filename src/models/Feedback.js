const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");

const FeedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please provide rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },

    comment: {
      type: String,
      required: [true, "Please provide review text"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

FeedbackSchema.index({ product: 1, user: 1 }, { unique: true });

FeedbackSchema.statics.calculateAverageRating = asyncHandler(
  async (productId) => {
    const result = await mongoose.model("Feedback").aggregate([
      { $match: { product: productId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          numOfFeedbacks: { $sum: 1 },
        },
      },
    ]);

    const { averageRating, numOfFeedbacks } = result[0] || {
      averageRating: 0,
      numOfFeedbacks: 0,
    };

    await mongoose.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(averageRating),
        numOfFeedbacks,
      }
    );
  }
);

FeedbackSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

FeedbackSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Feedback", FeedbackSchema);

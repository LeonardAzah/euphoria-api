const mongoose = require("mongoose");
const Address = require("./Address");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
    enum: ["xxs", "xl", "xs", "s", "m", "l", "xxl", "3xl", "4xl"],
  },
  quantity: { type: Number, required: true },

  creator: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    // required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: { type: productSchema, required: true },
      },
    ],
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: Address.schema,
      required: true,
    },
    billingAddress: {
      type: Address.schema,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

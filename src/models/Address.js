const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  companyName: String,
  streetAddress: {
    type: String,
    required: true,
  },
  unit: String,
  deliveryInstruction: String,
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressType: {
    type: String,
    enum: ["billing", "shipping"],
    default: "billing",
  },
  defaultAddress: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Address", addressSchema);

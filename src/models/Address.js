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
  // user: {
  //   type: mongoose.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
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

// addressSchema.pre("save", async function (next) {
//   if (this.defaultAddress) {
//     const Address = await mongoose.model("Address");
//     await Address.updateMany(
//       { user: this.user, addressType: this.addressType },
//       { $set: { defaultAddress: false } }
//     );
//   }
//   next();
// });

addressSchema.pre("save", async function (next) {
  // Check if the current address is being set as the default
  if (this.defaultAddress) {
    const Address = mongoose.model("Address");
    const existingAddresses = await Address.find({
      user: this.user,
      addressType: this.addressType,
    });

    for (const address of existingAddresses) {
      if (address._id.toString() === this._id.toString()) continue;

      address.defaultAddress = false;
      await address.save();
    }
  }
  next();
});

module.exports = mongoose.model("Address", addressSchema);

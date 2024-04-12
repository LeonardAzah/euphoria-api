const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      // required: [true, "Please provide email"],
      validate: {
        validator: validator.isEmail,
        message: "Please provide valid email",
      },
    },
    password: {
      type: String,
      // required: [true, "Please provide password"],
      minlength: 8,
    },
    googleId: { type: String },
    twitterId: { type: String },
    photo: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
    passwordOtp: {
      type: String,
    },
    cart: {
      items: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
      subTotal: {
        type: Number,
        default: 0,
      },
      shippingPrice: { type: Number, default: 0 },
      grandTotal: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

UserSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

UserSchema.methods.calculateCartTotal = async function () {
  let subTotal = 0;
  let shippingPrice = 0;

  for (const item of this.cart.items) {
    subTotal += item.product.price * item.quantity;
    shippingPrice += item.product.shippingCost * item.quantity;
  }

  // Update cart with calculated total and shipping prices
  this.cart.subTotal = subTotal;
  this.cart.shippingPrice = shippingPrice;
  this.cart.grandTotal = subTotal + shippingPrice;

  // Save and return the updated user
  return this.save();
};

UserSchema.methods.addToCart = async function (product, quantityToAdd = 1) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  if (cartProductIndex >= 0) {
    // If product already exists in cart, update quantity
    this.cart.items[cartProductIndex].quantity += quantityToAdd;
  } else {
    // If product doesn't exist in cart, add it
    this.cart.items.push({
      productId: product._id,
      quantity: quantityToAdd,
    });
  }

  await this.calculateCartTotal();

  return await this.save();
};

// Optimizing removeFromCart method using atomic operations
UserSchema.methods.removeFromCart = async function (productId) {
  const updatedUser = await this.model("User").findOneAndUpdate(
    { _id: this._id },
    { $pull: { "cart.items": { productId } } },
    { new: true }
  );

  await this.calculateCartTotal();

  return updatedUser;
};

// Optimizing clearCart method
UserSchema.methods.clearCart = async function () {
  this.cart = { items: [] };
  this.cart.totalPrice = 0;
  this.cart.shippingPrice = 0;
  return await this.save();
};

module.exports = mongoose.model("User", UserSchema);

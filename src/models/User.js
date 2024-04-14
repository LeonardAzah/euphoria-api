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
    phone: {
      type: String,
      minlength: 8,
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

    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Adress",
      },
    ],
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          color: {
            type: String,
            required: true,
          },
          size: {
            type: String,
            required: true,
          },
          shipping: {
            type: Number,
          },
          price: {
            type: Number,
          },
          name: {
            type: String,
          },
          quantity: { type: Number, required: true },
          subTotal: {
            type: Number,
            default: 0,
          },
        },
      ],
      totalItemPrice: {
        type: Number,
        default: 0,
      },
      totalShippingPrice: { type: Number, default: 1 },
      total: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre(
  "save",
  async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

UserSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

UserSchema.methods.calculateCartTotal = async function () {
  let totalItemPrice = 0;
  let totalShippingPrice = 0;

  for (const item of this.cart.items) {
    totalItemPrice += item.price * item.quantity;
    totalShippingPrice += item.shipping * item.quantity;
  }

  // Update cart with calculated total and shipping prices
  this.cart.totalItemPrice = totalItemPrice;
  this.cart.totalShippingPrice = totalShippingPrice;
  this.cart.total = totalItemPrice + totalShippingPrice;

  // Save and return the updated user
  await this.save();
};

UserSchema.methods.addToCart = async function (product, color, size, quantity) {
  let cartItemIndex = -1;
  // Find index of the item with matching product, color, and size
  for (let i = 0; i < this.cart.items.length; i++) {
    const item = this.cart.items[i];
    if (
      item.productId.toString() === product._id.toString() &&
      item.color === color &&
      item.size === size
    ) {
      cartItemIndex = i;
      break;
    }
  }

  if (quantity < 0) {
    // If quantity is negative, remove one item from cart
    if (cartItemIndex !== -1) {
      this.cart.items[cartItemIndex].quantity--;
      if (this.cart.items[cartItemIndex].quantity <= 0) {
        // Remove item from cart if quantity becomes zero or less
        this.cart.items.splice(cartItemIndex, 1);
      }
    }
  } else {
    // Product doesn't exist in the cart, add it
    if (cartItemIndex !== -1) {
      // If item exists in cart, update quantity
      this.cart.items[cartItemIndex].quantity += quantity;
    } else {
      const subTotal = product.price * quantity;
      this.cart.items.push({
        productId: product._id,
        quantity,
        shipping: product.shipping,
        price: product.price,
        color,
        size,
        subTotal,
        name: product.name,
      });
    }
  }

  await this.calculateCartTotal();

  return await this.save();
};

// Optimizing removeFromCart method using atomic operations
UserSchema.methods.removeFromCart = async function (productId, color, size) {
  const index = this.cart.items.findIndex(
    (item) =>
      item.productId.toString() === productId.toString() &&
      item.color === color &&
      item.size === size
  );

  if (index !== -1) {
    this.cart.items.splice(index, 1);
  }

  await this.calculateCartTotal();

  return await this.save();
};

// Optimizing clearCart method
UserSchema.methods.clearCart = async function () {
  this.cart = { items: [] };
  this.cart.totalItemPrice = 0;
  this.cart.totalShippingPrice = 0;
  this.cart.total = 0;
  return await this.save();
};

module.exports = mongoose.model("User", UserSchema);

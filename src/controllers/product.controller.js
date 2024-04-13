const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const paginate = require("../utils/paginate");
const checkPermissions = require("../utils/checkPermissions");

const createProduct = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  req.body.user = userId;

  const product = new Product(req.body);
  await product.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    msg: "Product created successfully",
    data: product,
  });
});

const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const populateOptions = [
    {
      model: "User",
      path: "user",
      select: "name",
    },
  ];

  const select = "name, price";

  const products = await paginate({
    model: Product,
    page,
    limit,
    select,
    populateOptions,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Products fetched sucessfully",
    data: products,
  });
});

const getAllMyProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const { userId } = req.user;
  const filters = { user: userId };
  const select = "name, price";

  const products = await paginate({
    model: Product,
    page,
    limit,
    filters,
    select,
    populateOptions,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Products fetched sucessfully",
    data: products,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    throw new CustomError.NotFoundError("Product Not Found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product fetched sucessfully",
    data: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const user = await User.findById(userId);
  const product = await Product.findById(id);
  if (!product) {
    throw new CustomError.NotFoundError("Project Not Found");
  }
  checkPermissions(user, product.user);

  const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product updated sucessfully",
    data: updatedProduct,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const user = await User.findById(userId);
  const product = await Product.findById(id);
  if (!product) {
    throw new CustomError.NotFoundError("Project Not Found");
  }
  checkPermissions(user, product.user);

  await product.deleteOne();
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product deleted sucessfully",
  });
});

const getProductByCategory = asyncHandler(async (req, res) => {
  const { category } = req.body;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { colors, minPrice, maxPrice, sizes, dressStyles } = req.query;

  const filters = { category };

  // Apply color filter
  if (colors) {
    filters.colors = { $in: colors.split(",") };
  }
  // Apply price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    filters.price = {};
    if (minPrice !== undefined) {
      filters.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice !== undefined) {
      filters.price.$lte = parseFloat(maxPrice);
    }
  }
  // Apply size filter
  if (sizes) {
    filters.size = { $in: sizes.split(",") };
  }

  // Apply dress style filter
  if (dressStyles) {
    filters.dressStyle = { $in: dressStyles.split(",") };
  }

  const select = "name, price";

  const products = await paginate({
    model: Product,
    page,
    limit,
    filters,
    select,
    populateOptions,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Products fetched sucessfully",
    data: products,
  });
});

const getCart = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const user = await User.findById(userId).populate("cart.items.productId");

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product added to cart sucessfully",
    data: user.cart,
  });
});

const addProductToCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    throw new CustomError("Product Not Found");
  }
  const cart = await User.addToCart(product._id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product added to cart sucessfully",
    data: cart,
  });
});

const removeProductFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    throw new CustomError("Product Not Found");
  }
  const user = await User.removeFromCart(id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product added to cart sucessfully",
    data: user.cart,
  });
});

const makeCheckout = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const user = await User.findById(userId)
    .populate("cart.items.product")
    .populate("address");

  if (user.cart.items.length === 0) {
    throw new CustomError.BadRequestError("Cart is empty");
  }
  //calculate ammount
  const amount = await user.calculateCartTotal();
  const grandTotal = amount.cart.grandTotal;
  const subTotal = amount.cart.subTotal;
  const shipping = amount.cart.shipping;

  // Retrieve user's default shipping and billing address
  let shippingAddress;
  let billingAddress;
  if (user.address && user.address.length > 0) {
    shippingAddress = user.address.find(
      (address) => address.defaultAddress && address.addressType === "shipping"
    );
    billingAddress = user.address.find(
      (address) => address.defaultAddress && address.addressType === "billing"
    );
  }

  if (!shippingAddress || !billingAddress) {
    throw new CustomError.BadRequestError(
      "Default shipping and billing addresses are required"
    );
  }

  // Create order
  const order = new Order({
    products: user.cart.items.map((item) => ({
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      price: item.product.price,
      color: item.product.color,
      size: item.product.size,
      creator: item.product.creator,
      quantity: item.quantity,
    })),
    user: userId,
    paymentMethod: req.body.paymentMethod,
    shippingAddress,
    billingAddress,
  });
  await order.save();

  //clear card data
  await user.clearCart();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Order created successfully",
    data: {
      order,
      subTotal,
      shipping,
      grandTotal,
    },
  });
});

const getAllOrder = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = { user: userId };
  const excludeFields = "user";

  const populateOptions = [
    {
      model: "Product",
      path: "product",
      select: "name, color, size",
    },
  ];
  const orders = await paginate({
    model: Order,
    page,
    limit,
    filters,
    excludeFields,
    populateOptions,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Orders fetched sucessfully",
    data: orders,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  const order = await Order.findOne({ user: userId, _id: id }).populate({
    path: "product",
    select: "name, color, size, price,imageUrl",
  });
  if (!order) {
    throw new CustomError.NotFoundError("Order not found");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Order fetched sucessfully",
    data: order,
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getAllMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByCategory,
  addProductToCart,
  removeProductFromCart,
  removeProductFromCart,
  getCart,
  makeCheckout,
  getAllOrder,
  getOrderById,
};

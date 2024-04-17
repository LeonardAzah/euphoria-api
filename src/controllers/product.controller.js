const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const Address = require("../models/Address");
const asyncHandler = require("../utils/asyncHandler");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const paginate = require("../utils/paginate");
const checkPermissions = require("../utils/checkPermissions");
const findDefaultAddress = require("../utils/findDefaultAddress");

const createProduct = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  req.body.creator = userId;

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
      path: "creator",
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
const searchProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { query } = req.body;
  const populateOptions = [
    {
      model: "User",
      path: "creator",
      select: "name",
    },
  ];

  const select = "name, price";

  const regexQuery = new RegExp(query, "i");
  const filters = {
    $or: [
      { name: regexQuery },
      { description: regexQuery },
      { category: regexQuery },
      { sizes: regexQuery },
      { colors: regexQuery },
    ],
  };

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

const getAllMyProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const { userId } = req.user;
  const filters = { creator: userId };
  const select = "name, price";

  const products = await paginate({
    model: Product,
    page,
    limit,
    filters,
    select,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Products fetched sucessfully",
    data: products,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate({
    path: "creator",
    select: "name",
  });

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
  checkPermissions(user, product.creator);

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
  checkPermissions(user, product.creator);

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
  const populateOptions = [
    {
      model: "User",
      path: "creator",
      select: "name",
    },
  ];
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
  const user = await User.findById(userId).populate("cart.items");

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product added to cart sucessfully",
    data: user.cart,
  });
});

const addProductToCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { color, size, quantity } = req.body;
  const product = await Product.findById(id);
  const user = await User.findById(userId);
  if (!product) {
    throw new CustomError.NotFoundError("Product Not Found");
  }

  const data = await user.addToCart(product, color, size, quantity);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product added to cart sucessfully",
    data: data.cart,
  });
});

const removeProductFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { color, size } = req.body;

  const product = await Product.findById(id);
  const user = await User.findById(userId);
  if (!product) {
    throw new CustomError("Product Not Found");
  }
  const data = await user.removeFromCart(product._id, color, size);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product added to cart sucessfully",
    data: user.cart,
  });
});

const makeCheckout = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  let shippingAddress;
  let billingAddress;

  const user = await User.findById(userId);

  if (user.cart.items.length === 0) {
    throw new CustomError.BadRequestError("Cart is empty");
  }
  //calculate ammount
  const grandTotal = user.cart.totalItemPrice;
  const subTotal = user.cart.totalShippingPrice;
  const shipping = user.cart.total;

  if (!req.body.shippingAddress) {
    if (user.address && user.address.length > 0) {
      shippingAddress = await findDefaultAddress(user, "shipping");
    }
  } else {
    shippingAddress = req.body.shippingAddress;
  }

  if (!req.body.billingAddress) {
    if (user.address && user.address.length > 0) {
      billingAddress = await findDefaultAddress(user, "billing");
    }
  } else {
    billingAddress = req.body.billingAddress;
  }

  if (req.body.billingAddress && req.body.billingAddress.save) {
    const newAddress = new Address(req.body.billingAddress);
    newAddress.addressType = "billing";
    // newAddress.user = user._id;
    await newAddress.save();
    user.address.push(newAddress);
    await user.save();
  }

  if (req.body.shippingAddress && req.body.shippingAddress.save) {
    const newAddress = new Address(req.body.shippingAddress);
    newAddress.addressType = "shipping";
    // newAddress.user = user._id;
    await newAddress.save();
    await newAddress.save();
    user.address.push(newAddress);
    await user.save();
  }

  // Create order
  const order = new Order({
    products: user.cart.items.map((item) => ({
      product: {
        name: item.name,
        price: item.price,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      },
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

  const orders = await paginate({
    model: Order,
    page,
    limit,
    filters,
    excludeFields,
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

  const order = await Order.findOne({ user: userId, _id: id }).select("-user");
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
  searchProducts,
};

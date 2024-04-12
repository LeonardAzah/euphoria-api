const Product = require("../models/Product");
const User = require("../models/User");
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
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    throw new CustomError("Product Not Found");
  }
  const user = await User.removeFromCart(productId);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Product added to cart sucessfully",
    data: user.cart,
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
};

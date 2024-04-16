const Feedback = require("../models/Feedback");
const Product = require("../models/Product");
const User = require("../models/User");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const paginate = require("../utils/paginate");
const asyncHandler = require("../utils/asyncHandler");
const checkPermissions = require("../utils/checkPermissions");

const creatFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { rating, comment } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new CustomError.NotFoundError("Product not found");
  }

  const alreadySubmitted = await Feedback.findOne({
    product: id,
    user: userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted feedback for this product"
    );
  }

  const feedback = await Feedback.create({
    rating,
    comment,
    user: userId,
    product: product._id,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    msg: "Feedback created successfully",
    data: feedback,
  });
});

const getAllFeedback = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const populateOptions = [
    {
      model: "User",
      path: "user",
      select: "name photo",
    },
  ];

  const feedbacks = await paginate({
    model: Feedback,
    page,
    limit,
    populateOptions,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Feedbacks fetched sucessfully",
    data: feedbacks,
  });
});

const getMyFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    throw new CustomError.NotFoundError("Product not found");
  }
  const feedback = await Feedback.findOne({
    product: id,
    user: req.user.userId,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Feedback fetched sucessfully",
    data: feedback,
  });
});
const getFeedbackById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feedback = await Feedback.findById(id);

  if (!feedback) {
    throw new CustomError.NotFoundError("Feedback not found");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Feedback fetched sucessfully",
    data: feedback,
  });
});

const getProductFeedbacks = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const populateOptions = [
    {
      model: "User",
      path: "user",
      select: "name photo",
    },

    {
      model: "Product",
      path: "product",
      select: "averageRating numOfFeedbacks",
    },
  ];
  const filters = { product: id };
  const product = await Product.findById(id);

  if (!product) {
    throw new CustomError.NotFoundError("Product not found");
  }

  const feedbacks = await paginate({
    model: Feedback,
    page,
    limit,
    filters,
    populateOptions,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Feedbacks fetched sucessfully",
    data: feedbacks,
  });
});

const updateFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const { userId } = req.user;

  const user = await User.findById(userId);

  const feedback = await Feedback.findById(id);

  if (!feedback) {
    throw new CustomError.NotFoundError("Feedback not found");
  }
  checkPermissions(user, feedback.user);

  (feedback.rating = rating), (feedback.comment = comment);

  feedback.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Feedback updated sucessfully",
    data: feedback,
  });
});
const deleteFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user.userId);

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw new CustomError.NotFoundError("Feedback not found");
  }

  checkPermissions(user, feedback.user);

  await Feedback.findByIdAndDelete(id);

  res.status(StatusCodes.NO_CONTENT).json({
    success: true,
    message: "Feedback deleted sucessfully",
  });
});

module.exports = {
  creatFeedback,
  getAllFeedback,
  getMyFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getProductFeedbacks,
};

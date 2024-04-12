const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const paginate = require("../utils/paginate");

const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const isTaken = await User.isEmailTaken(email);
  if (isTaken) {
    throw new CustomError.BadRequestError("Email already exists");
  }
  await User.create({
    email,
    password,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    msg: "User account created successfully",
  });
});

const getAllUser = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const excludeFields = "password otp passwordTokenExpirationDate";

  const users = await paginate({
    model: User,
    page,
    limit,
    excludeFields,
  });
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Users fetched sucessfully",
    data: users,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError("User Not Found");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    message: "User fetched sucessfully",
    data: user,
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError("User Not Found");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    message: "User fetched sucessfully",
    data: user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate({ id }, req.body, {
    new: true,
    select: "-password",
  });
  if (!user) {
    throw new CustomError.NotFoundError("User Not Found");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    message: "User updated sucessfully",
    data: user,
  });
});
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new CustomError.NotFoundError("User Not Found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User deleted sucessfully",
  });
});

module.exports = {
  registerUser,
  getAllUser,
  getUserById,
  deleteUser,
  updateUser,
  getCurrentUser,
};

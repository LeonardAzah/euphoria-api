const Address = require("../models/Address");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const checkPermissions = require("../utils/checkPermissions");

const createAddress = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  req.body.user = userId;

  const user = await User.findById(userId);

  const address = new Address(req.body);
  await address.save();
  user.address.push(address);
  await user.save();
  await res.status(StatusCodes.CREATED).json({
    success: true,
    msg: "User account created successfully",
    data: address,
  });
});

const getAllAddresses = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const addresses = await Address.find({ user: userId });
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Addresses fetched sucessfully",
    data: addresses,
  });
});

const getAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const address = await Address.findById(id);
  if (!address) {
    throw new CustomError.NotFoundError("Adress Not Found");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Adress fetched sucessfully",
    data: address,
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const user = await User.findById(userId);
  const address = await Address.findById(id);
  if (!address) {
    throw new CustomError.NotFoundError("Address Not Found");
  }
  checkPermissions(user, address.user);

  Object.assign(address, req.body);
  const updatedAddress = await address.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Address updated sucessfully",
    data: updatedAddress,
  });
});

const defaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = {
    defaultAddress: true,
  };
  const address = await Address.findByIdAndUpdate(id, updates, { new: true });
  if (!address) {
    throw new CustomError.NotFoundError("Address Not Found");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Default set sucessfully",
    data: address,
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const user = await User.findById(userId);
  const address = await Address.findById(id);
  if (!address) {
    throw new CustomError.NotFoundError("Address Not Found");
  }
  checkPermissions(user, address.user);

  await address.deleteOne();
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Address deleted sucessfully",
  });
});

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  defaultAddress,
};

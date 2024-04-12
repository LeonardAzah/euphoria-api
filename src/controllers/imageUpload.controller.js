const asyncHandler = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadImage = asyncHandler(async (req, res) => {
  const uploader = async (path) => await cloudinary.uploads(path, "euphoria");

  const file = req.file;

  if (!file) {
    throw new CustomError.BadRequestError("Files required");
  }

  const { path } = file;
  const url = await uploader(path);
  fs.unlinkSync(path);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "image uploaded sucessfully",
    data: url.url,
  });
});

module.exports = { uploadImage };

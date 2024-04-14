const CustomError = require("../errors");

const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser._id.toString() !== resourceUserId.toString()) {
    throw new CustomError.UnauthorizedError("Unauthorized to access resource");
  }
};

module.exports = checkPermissions;

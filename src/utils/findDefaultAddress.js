const Address = require("../models/Address");
const CustomError = require("../errors");

const findDefaultAddress = async (user, addressType) => {
  for (const addressId of user.address) {
    const address = await Address.findById(addressId);
    if (
      address &&
      address.defaultAddress &&
      address.addressType == addressType
    ) {
      return address;
    }
  }
  throw new CustomError.BadRequestError(
    `Default ${addressType} address is required`
  );
};

module.exports = findDefaultAddress;

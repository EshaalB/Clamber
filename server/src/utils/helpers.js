/**
 * Helper Utilities
 * Common helper functions used across the application.
 */

/**
 * Generate a random numeric OTP of given length.
 */
const generateOTP = (length = 4) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

/**
 * Build a pagination response object.
 */
const paginateResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Pick specified keys from an object (for DTO creation).
 */
const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

/**
 * Sanitize user object for client response (remove sensitive fields).
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.passwordHash;
  delete userObj.verificationCode;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpires;
  delete userObj.__v;
  return userObj;
};

module.exports = {
  generateOTP,
  paginateResponse,
  pick,
  sanitizeUser,
};

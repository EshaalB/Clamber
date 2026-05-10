/**
 * Authentication Middleware
 * Verifies JWT access tokens and attaches user to request.
 */
const { verifyAccessToken } = require('../../infrastructure/security/jwt');
const User = require('../../infrastructure/database/models/User');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const authenticate = catchAsync(async (req, res, next) => {
  // 1. Extract token from Authorization header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Please log in to access this resource');
  }

  // 2. Verify token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token expired. Please refresh your token');
    }
    throw ApiError.unauthorized('Invalid token');
  }

  // 3. Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  // 4. Attach user to request
  req.user = user;
  next();
});

module.exports = authenticate;

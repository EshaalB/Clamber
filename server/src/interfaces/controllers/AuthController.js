/**
 * AuthController: Student identity and session lifecycle management.
 * Handles registration, MFA/Email verification, token rotation, and Google OAuth flows.
 */
const User = require('../../infrastructure/database/models/User');
const Session = require('../../infrastructure/database/models/Session');
const { hashPassword, comparePassword } = require('../../infrastructure/security/password');
const { generateTokenPair, verifyRefreshToken } = require('../../infrastructure/security/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../infrastructure/external-services/EmailService');
const { generateOTP, sanitizeUser } = require('../../utils/helpers');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { v4: uuidv4 } = require('uuid');
const env = require('../../config/env');

const register = catchAsync(async (req, res) => {
  const { name, email, password, referralCode } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(password);
  const verificationCode = generateOTP(4);
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    name, email, passwordHash, referralCode,
    verificationCode, verificationCodeExpires,
  });

  await sendVerificationEmail(email, verificationCode);

  res.status(201).json({
    status: 'success',
    message: 'Registration successful. Verify your email to continue.',
    data: { user: sanitizeUser(user) },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.passwordHash) throw ApiError.unauthorized('Invalid credentials');

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

  const tokens = generateTokenPair(user);

  await Session.create({
    userId: user._id,
    refreshToken: tokens.refreshToken,
    userAgent: req.get('user-agent') || '',
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.json({
    status: 'success',
    data: {
      user: sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');
  if (!user) throw ApiError.notFound('User not found');
  if (user.isVerified) return res.json({ status: 'success', message: 'Already verified' });

  if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
    throw ApiError.badRequest('Invalid or expired code');
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  res.json({ status: 'success', message: 'Email verified successfully' });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  
  if (user) {
    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(email, resetToken);
  }

  res.json({ status: 'success', message: 'Recovery link sent if account exists.' });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) throw ApiError.badRequest('Invalid or expired token');

  user.passwordHash = await hashPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  await Session.deleteMany({ userId: user._id });

  res.json({ status: 'success', message: 'Password reset successful.' });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;
  
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const session = await Session.findOne({ refreshToken: token, userId: decoded.id });
  if (!session) throw ApiError.unauthorized('Session expired');

  const user = await User.findById(decoded.id);
  if (!user) throw ApiError.unauthorized('User not found');

  const tokens = generateTokenPair(user);
  session.refreshToken = tokens.refreshToken;
  session.expiresAt = new Date(Date.now() + 604800000);
  await session.save();

  res.json({ status: 'success', data: { ...tokens } });
});

const logout = catchAsync(async (req, res) => {
  if (req.body.refreshToken) await Session.findOneAndDelete({ refreshToken: req.body.refreshToken });
  res.json({ status: 'success', message: 'Logged out successfully' });
});

const googleAuthCallback = catchAsync(async (req, res) => {
  const user = req.user;
  const tokens = generateTokenPair(user);

  await Session.create({
    userId: user._id,
    refreshToken: tokens.refreshToken,
    userAgent: req.get('user-agent') || 'OAuth',
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + 604800000),
  });

  const redirectUrl = new URL(`${env.CLIENT_URL}/auth/success`);
  redirectUrl.searchParams.append('accessToken', tokens.accessToken);
  redirectUrl.searchParams.append('refreshToken', tokens.refreshToken);
  redirectUrl.searchParams.append('user', JSON.stringify(sanitizeUser(user)));

  res.redirect(redirectUrl.toString());
});

module.exports = {
  register, login, verifyEmail, forgotPassword,
  resetPassword, refreshToken, logout, googleAuthCallback,
};

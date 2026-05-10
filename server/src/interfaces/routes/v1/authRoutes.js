/**
 * Auth Routes
 */
const router = require('express').Router();
const AuthController = require('../../controllers/AuthController');
const validate = require('../../middlewares/validate');
const auditLog = require('../../middlewares/auditLog');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} = require('../../validators/authValidator');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const env = require('../../../config/env');

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'fail', message: 'Too many attempts. Please try again in 15 minutes.' },
});

router.post('/register', authLimiter, validate(registerSchema), auditLog('USER_REGISTER'), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), auditLog('USER_LOGIN'), AuthController.login);
router.post('/verify-email', validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', AuthController.logout);

// ─── Google OAuth ───
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed` }),
  AuthController.googleAuthCallback
);

module.exports = router;

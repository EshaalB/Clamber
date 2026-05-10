/**
 * Environment Configuration
 * Loads and validates all environment variables.
 */
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/clamber',

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Email (Use Gmail with App Password for free real emails)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER || '', // Your gmail
  SMTP_PASS: process.env.SMTP_PASS || '', // Your App Password (not your real password)
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@clamber.app',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'https://clamber-uh2nq.sevalla.app/api/v1/auth/google/callback',

  // AI
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  WELLNESS_ENCRYPTION_KEY: process.env.WELLNESS_ENCRYPTION_KEY || '',

  // Frontend
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Admin
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@clamber.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',

  isDev: () => env.NODE_ENV === 'development',
  isProd: () => env.NODE_ENV === 'production',
};

// ─── Validation ───
const validateEnv = () => {
  const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ CRITICAL: Missing environment variables: ${missing.join(', ')}`);
    // if (env.isProd()) process.exit(1);
  }

  const warnings = [];
  if (!process.env.GROQ_API_KEY) warnings.push('GROQ_API_KEY');
  if (!process.env.GOOGLE_CLIENT_ID) warnings.push('GOOGLE_CLIENT_ID');

  if (warnings.length > 0) {
    console.warn(`⚠️  WARNING: Missing optional environment variables: ${warnings.join(', ')}`);
  }
};

validateEnv();

module.exports = env;

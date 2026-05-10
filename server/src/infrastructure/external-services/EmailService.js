/**
 * Email Service
 * Sends emails using Nodemailer. Uses Ethereal in development for testing.
 */
const nodemailer = require('nodemailer');
const env = require('../../config/env');
const logger = require('../../utils/logger');

let transporter = null;

/**
 * Initialize the email transporter.
 * In dev mode, creates an Ethereal test account automatically.
 */
const initializeTransporter = async () => {
  if (transporter) return transporter;

  if (env.isDev() && (!env.SMTP_USER || !env.SMTP_PASS)) {
    // Create Ethereal test account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`📧 Ethereal email account created: ${testAccount.user}`);
      logger.info(`   View emails at: https://ethereal.email/login`);
    } catch (err) {
      logger.warn('Could not create Ethereal account, email sending will be mocked');
      transporter = { sendMail: async (opts) => {
        logger.info(`[MOCK EMAIL] To: ${opts.to}, Subject: ${opts.subject}`);
        return { messageId: 'mock-' + Date.now() };
      }};
    }
  } else {
    const isGmail = env.SMTP_HOST.includes('gmail.com');
    transporter = nodemailer.createTransport({
      service: isGmail ? 'gmail' : undefined,
      host: isGmail ? undefined : env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

/**
 * Send a verification code email.
 */
const sendVerificationEmail = async (email, code) => {
  const transport = await initializeTransporter();
  const info = await transport.sendMail({
    from: `"Clamber" <${env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verify your Clamber account',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7cb9e8; text-align: center; padding: 24px; background: #f8fafc; border-radius: 12px; margin: 24px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });

  logger.info(`📧 VERIFICATION CODE FOR ${email}: ${code}`);

  if (env.isDev() && info.messageId) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) logger.info(`📧 Preview URL: ${previewUrl}`);
  }

  return info;
};

/**
 * Send a password reset email.
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const transport = await initializeTransporter();
  const info = await transport.sendMail({
    from: `"Clamber" <${env.EMAIL_FROM}>`,
    to: email,
    subject: 'Reset your Clamber password',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>You requested a password reset. Click the button below:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #7cb9e8; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });

  if (env.isDev() && info.messageId) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) logger.info(`📧 Preview URL: ${previewUrl}`);
  }

  return info;
};

module.exports = {
  initializeTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
};

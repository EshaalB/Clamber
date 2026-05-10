/**
 * Audit Logger Middleware
 * Logs significant API actions for admin monitoring.
 */
const AuditLog = require('../../infrastructure/database/models/AuditLog');
const logger = require('../../utils/logger');

const auditLog = (action) => {
  return async (req, res, next) => {
    // Log after response is sent
    res.on('finish', async () => {
      try {
        await AuditLog.create({
          action,
          userId: req.user ? req.user._id : null,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          details: {
            body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
          },
        });
      } catch (err) {
        logger.error('Audit log error:', err.message);
      }
    });
    next();
  };
};

// Remove sensitive fields from logged body
const sanitizeBody = (body) => {
  if (!body) return undefined;
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.passwordHash;
  delete sanitized.token;
  delete sanitized.refreshToken;
  return sanitized;
};

module.exports = auditLog;

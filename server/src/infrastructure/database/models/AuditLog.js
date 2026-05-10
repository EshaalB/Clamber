/**
 * AuditLog Mongoose Model
 * Tracks important actions for admin visibility.
 */
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ip: { type: String },
    userAgent: { type: String },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    method: { type: String },
    url: { type: String },
    statusCode: { type: Number },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ userId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

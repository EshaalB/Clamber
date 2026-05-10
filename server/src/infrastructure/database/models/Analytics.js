/**
 * Analytics Mongoose Model
 * Stores daily wellness and productivity metrics for a user.
 */
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    stressLevel: { type: Number, min: 0, max: 100, default: 0 },
    sleepHours: { type: Number, min: 0, max: 24, default: 0 },
    tasksCompleted: { type: Number, min: 0, default: 0 },
    studyHours: { type: Number, min: 0, max: 24, default: 0 },
    burnoutScore: { type: Number, min: 0, max: 100, default: 0 },
    factors: {
      workload: { type: Number, min: 0, max: 100, default: 0 },
      sleepQuality: { type: Number, min: 0, max: 100, default: 0 },
      deadlinePressure: { type: Number, min: 0, max: 100, default: 0 },
    },
    encryptedWellness: { type: String, default: '' },
  },
  { timestamps: true }
);

analyticsSchema.index({ userId: 1, date: -1 });
// Ensure one entry per user per day
analyticsSchema.index({ userId: 1, date: 1 }, { unique: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;

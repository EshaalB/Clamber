/**
 * User Mongoose Model
 * Represents a student or admin user in the Clamber platform.
 */
const mongoose = require('mongoose');
const { ROLES, STUDY_PREFERENCES, BREAK_PREFERENCES } = require('../../../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    avatar: { type: String, default: '' },

    // Google OAuth
    googleId: { type: String, sparse: true, index: true },

    // Academic Info (from onboarding)
    year: { type: Number, min: 1, max: 4 },
    major: { type: String, trim: true },
    targetGPA: { type: Number, min: 0, max: 4 },
    currentGPA: { type: Number, min: 0, max: 4, default: 0 },

    // Study Preferences
    studyPreference: { type: String, enum: Object.values(STUDY_PREFERENCES) },
    breakPreference: { type: String, enum: Object.values(BREAK_PREFERENCES) },

    // Wellness Baseline
    sleepHours: { type: Number, min: 1, max: 16, default: 7 },
    stressLevel: { type: Number, min: 1, max: 5, default: 3 },

    // Commitments
    commitments: {
      prayerReminders: { type: Boolean, default: false },
      familyTime: { type: Boolean, default: false },
      partTimeJob: { type: Boolean, default: false },
    },

    // App Settings
    settings: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      accentColor: { type: String, default: '#7cb9e8' },
      fontSize: { type: String, enum: ['sm', 'base', 'lg', 'xl'], default: 'base' },
      language: { type: String, default: 'en' },
      soundEnabled: { type: Boolean, default: true },
      volume: { type: Number, min: 0, max: 1, default: 0.5 },
      accessibility: {
        highContrast: { type: Boolean, default: false },
        reducedMotion: { type: Boolean, default: false },
        dyslexiaFont: { type: Boolean, default: false },
      },
      notifications: {
        taskReminders: { type: Boolean, default: true },
        burnoutAlerts: { type: Boolean, default: true },
        deadlineWarnings: { type: Boolean, default: true },
        weeklySummary: { type: Boolean, default: false },
        gradeMilestones: { type: Boolean, default: true },
        scheduleReminders: { type: Boolean, default: true },
      },
      prayerTimes: {
        mode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
        location: { type: String, trim: true, default: '' },
        fajr: { type: String, trim: true, default: '' },
        dhuhr: { type: String, trim: true, default: '' },
        asr: { type: String, trim: true, default: '' },
        maghrib: { type: String, trim: true, default: '' },
        isha: { type: String, trim: true, default: '' },
      },
      blockedTimePeriods: [
        {
          dayOfWeek: { type: Number, min: 0, max: 6, required: true },
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
          label: { type: String, trim: true, default: 'Blocked time' },
        },
      ],
      advisorAccess: {
        consentEnabled: { type: Boolean, default: false },
        advisorEmail: { type: String, trim: true, lowercase: true, default: '' },
      },
      privacy: {
        shareAnalytics: { type: Boolean, default: true },
        publicProfile: { type: Boolean, default: false },
      },
    },

    // AI Usage Limit
    aiUsage: {
      count: { type: Number, default: 0 },
      resetAt: { type: Date, default: Date.now },
    },

    // Verification
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationCodeExpires: { type: Date, select: false },

    // Password Reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    // Onboarding
    onboardingCompleted: { type: Boolean, default: false },
    lastWellnessUpdate: { type: Date, default: Date.now },

    // Referral
    referralCode: { type: String, trim: true },

    // Soft Delete
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───
userSchema.index({ role: 1 });
userSchema.index({ isDeleted: 1 });

// ─── Query Middleware: Exclude soft-deleted by default ───
userSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeSoftDeleted) return next();
  this.where({ isDeleted: { $ne: true } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

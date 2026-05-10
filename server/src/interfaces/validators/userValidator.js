/**
 * User Validators
 */
const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  avatar: Joi.string().allow(''),
  year: Joi.number().integer().min(1).max(4),
  major: Joi.string().trim().max(100),
  targetGPA: Joi.number().min(0).max(4),
  currentGPA: Joi.number().min(0).max(4),
}).min(1);

const updateSettingsSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark'),
  accentColor: Joi.string().pattern(/^(#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})|var\(--[\w-]+\))$/),
  fontSize: Joi.string().valid('sm', 'base', 'lg', 'xl'),
  language: Joi.string().valid('en', 'ur'),
  soundEnabled: Joi.boolean(),
  volume: Joi.number().min(0).max(1),
  notifications: Joi.object({
    taskReminders: Joi.boolean(),
    burnoutAlerts: Joi.boolean(),
    deadlineWarnings: Joi.boolean(),
    weeklySummary: Joi.boolean(),
    gradeMilestones: Joi.boolean(),
    scheduleReminders: Joi.boolean(),
  }),
  prayerTimes: Joi.object({
    mode: Joi.string().valid('auto', 'manual'),
    location: Joi.string().allow(''),
    fajr: Joi.string().allow(''),
    dhuhr: Joi.string().allow(''),
    asr: Joi.string().allow(''),
    maghrib: Joi.string().allow(''),
    isha: Joi.string().allow(''),
  }),
  blockedTimePeriods: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().integer().min(0).max(6).required(),
      startTime: Joi.string().required(),
      endTime: Joi.string().required(),
      label: Joi.string().allow(''),
    })
  ),
  advisorAccess: Joi.object({
    consentEnabled: Joi.boolean(),
    advisorEmail: Joi.string().email().allow(''),
  }),
}).min(1);

const onboardingSchema = Joi.object({
  name: Joi.string().trim().allow('').max(100),
  year: Joi.number().integer().min(1).max(4),
  major: Joi.string().trim().max(100),
  courses: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().required(),
      credits: Joi.number().integer().min(1).max(6).required(),
    })
  ),
  targetGPA: Joi.number().min(0).max(4),
  studyPreference: Joi.string().valid('morning', 'afternoon', 'evening', 'night'),
  breakPreference: Joi.string().valid('none', 'short', 'medium', 'long'),
  sleepHours: Joi.number().min(1).max(16),
  stressLevel: Joi.number().integer().min(1).max(5),
  commitments: Joi.object({
    prayerReminders: Joi.boolean(),
    familyTime: Joi.boolean(),
    partTimeJob: Joi.boolean(),
  }),
});

module.exports = { updateProfileSchema, updateSettingsSchema, onboardingSchema };

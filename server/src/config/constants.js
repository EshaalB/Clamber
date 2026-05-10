/**
 * Application Constants
 * Centralized enums and magic values used across the application.
 */

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  ADVISOR: 'advisor',
};

const TASK_STATUS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const TASK_PRIORITY = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const FEEDBACK_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
};

const NOTIFICATION_TYPES = {
  TASK_REMINDER: 'task_reminder',
  DEADLINE_WARNING: 'deadline_warning',
  BURNOUT_ALERT: 'burnout_alert',
  SYSTEM: 'system',
  ACHIEVEMENT: 'achievement',
};

const STUDY_PREFERENCES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  NIGHT: 'night',
};

const BREAK_PREFERENCES = {
  NONE: 'none',
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  TASK_STATUS,
  TASK_PRIORITY,
  FEEDBACK_STATUS,
  NOTIFICATION_TYPES,
  STUDY_PREFERENCES,
  BREAK_PREFERENCES,
  PAGINATION,
};

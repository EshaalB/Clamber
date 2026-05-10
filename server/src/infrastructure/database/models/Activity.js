/**
 * Activity Mongoose Model
 * Tracks user actions for the "Recent Activity" feed.
 */
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { 
      type: String, 
      enum: ['task_completed', 'task_created', 'course_added', 'grade_updated', 'ai_chat', 'burnout_warning'],
      required: true 
    },
    title: { type: String, required: true },
    description: { type: String },
    metadata: { type: Object }, // Store IDs or extra info
  },
  { timestamps: true }
);

activitySchema.index({ userId: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;

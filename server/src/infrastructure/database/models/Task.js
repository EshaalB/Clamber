/**
 * Task Mongoose Model
 * Represents an academic task/assignment in the Clamber platform.
 */
const mongoose = require('mongoose');
const { TASK_STATUS, TASK_PRIORITY } = require('../../../config/constants');

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.NOT_STARTED,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
    },
    subject: { type: String, trim: true, default: 'General' },
    description: { type: String, trim: true, maxlength: 1000 },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, subject: 1 });

// ─── Soft delete filter ───
taskSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeSoftDeleted) return next();
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

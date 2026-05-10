/**
 * Course Mongoose Model
 * Represents an academic course for GPA tracking.
 */
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    credits: { type: Number, required: true, min: 1, max: 6, default: 3 },
    currentGrade: { type: Number, min: 0, max: 100, default: 0 },
    targetGrade: { type: Number, min: 0, max: 100, default: 80 },
    requiredAverage: { type: Number, min: 0, max: 100 },
    revisedTarget: { type: Number, min: 0, max: 100, default: null },
    assessments: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ['Assignment', 'Quiz', 'Midterm', 'Final', 'Other'], default: 'Assignment' },
        weight: { type: Number, required: true, min: 0, max: 100 },
        grade: { type: Number, min: 0, max: 100, default: null },
      }
    ],
    status: {
      type: String,
      enum: ['On Track', 'Slight Risk', 'At Risk'],
      default: 'On Track',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Removed duplicate index userId: 1

courseSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeSoftDeleted) return next();
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

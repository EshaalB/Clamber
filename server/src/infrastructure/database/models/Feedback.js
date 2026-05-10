/**
 * Feedback Mongoose Model
 */
const mongoose = require('mongoose');
const { FEEDBACK_STATUS } = require('../../../config/constants');

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['bug', 'feature', 'general', 'complaint'], default: 'general' },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    status: { type: String, enum: Object.values(FEEDBACK_STATUS), default: FEEDBACK_STATUS.PENDING },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

feedbackSchema.index({ status: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;

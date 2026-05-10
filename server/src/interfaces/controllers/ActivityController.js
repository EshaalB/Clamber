/**
 * ActivityController: Academic engagement and platform interaction logging.
 * Serves the recent activity feed and provides helpers for recording internal events.
 */
const Activity = require('../../infrastructure/database/models/Activity');
const catchAsync = require('../../utils/catchAsync');

const getActivities = catchAsync(async (req, res) => {
  const activities = await Activity.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.json({
    status: 'success',
    data: activities
  });
});

const recordActivity = async (userId, type, title, description = '', metadata = {}) => {
  try {
    await Activity.create({ userId, type, title, description, metadata });
  } catch (err) {
    console.error('Activity logging failed', err);
  }
};

module.exports = { getActivities, recordActivity };

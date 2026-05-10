/**
 * NotificationController: Real-time student alerts and communication logs.
 * Manages in-app notifications, delivery status, and read-status synchronization.
 */
const Notification = require('../../infrastructure/database/models/Notification');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

const getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    status: 'success',
    data: notifications,
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw ApiError.notFound('Notification not found');

  res.json({
    status: 'success',
    data: notification,
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ status: 'success', message: 'All notifications marked as read' });
});

const createNotification = async (userId, data) => {
  try {
    return await Notification.create({ userId, ...data });
  } catch (err) {
    console.error('Notification creation failed', err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };

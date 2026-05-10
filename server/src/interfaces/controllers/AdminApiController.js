/**
 * AdminApiController: Programmatic administrative oversight and platform management.
 * Provides granular endpoints for user lifecycle management, system configuration, and audit log analysis.
 */
const User = require('../../infrastructure/database/models/User');
const Task = require('../../infrastructure/database/models/Task');
const Course = require('../../infrastructure/database/models/Course');
const SystemSettings = require('../../infrastructure/database/models/SystemSettings');
const AuditLog = require('../../infrastructure/database/models/AuditLog');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

const getStats = catchAsync(async (req, res) => {
  const stats = {
    totalUsers: await User.countDocuments(),
    totalTasks: await Task.countDocuments(),
    totalCourses: await Course.countDocuments(),
    activeStudents: await User.countDocuments({ role: 'user' }),
    advisors: await User.countDocuments({ role: 'advisor' }),
  };
  res.json({ status: 'success', data: stats });
});

const getUsers = catchAsync(async (req, res) => {
  const { search = '' } = req.query;
  const filter = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
  const users = await User.find(filter).sort({ createdAt: -1 }).select('-passwordHash');
  res.json({ status: 'success', data: users });
});

const promoteToAdvisor = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: 'advisor' }, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ status: 'success', message: `User ${user.name} promoted to Advisor`, data: user });
});

const getLogs = catchAsync(async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).populate('userId', 'name');
  res.json({ status: 'success', data: logs });
});

const resetPassword = catchAsync(async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const { hashPassword } = require('../../infrastructure/security/password');
  user.passwordHash = await hashPassword(newPassword || 'clamber123');
  await user.save();

  res.json({ status: 'success', message: `Password for ${user.name} reset to default.` });
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ status: 'success', message: 'User deleted successfully' });
});

const verifyUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ status: 'success', message: `User ${user.name} manually verified` });
});

const bulkVerify = catchAsync(async (req, res) => {
  await User.updateMany({ _id: { $in: req.body.userIds } }, { isVerified: true });
  res.json({ status: 'success', message: 'Users verified in bulk' });
});

const bulkDelete = catchAsync(async (req, res) => {
  await User.deleteMany({ _id: { $in: req.body.userIds } });
  res.json({ status: 'success', message: 'Users deleted in bulk' });
});

const getSystemSettings = catchAsync(async (req, res) => {
  const settings = (await SystemSettings.findOne()) || (await SystemSettings.create({}));
  res.json({ status: 'success', data: settings });
});

const updateSystemSettings = catchAsync(async (req, res) => {
  let settings = (await SystemSettings.findOne()) || new SystemSettings();
  Object.assign(settings, req.body);
  settings.updatedBy = req.user._id;
  await settings.save();
  res.json({ status: 'success', data: settings });
});

const getUserActivity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const [tasks, courses, logs] = await Promise.all([
    Task.find({ userId: id }),
    Course.find({ userId: id }),
    AuditLog.find({ userId: id }).sort({ createdAt: -1 }).limit(20)
  ]);
  res.json({ status: 'success', data: { tasks, courses, logs } });
});

module.exports = {
  getStats, getUsers, promoteToAdvisor, deleteUser,
  resetPassword, verifyUser, getLogs, bulkVerify,
  bulkDelete, getSystemSettings, updateSystemSettings, getUserActivity
};

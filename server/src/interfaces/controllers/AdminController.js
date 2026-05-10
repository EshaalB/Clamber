/**
 * AdminController: Backend administrative oversight and panel management.
 * Provides full CRUD capabilities for users, tasks, and courses via the EJS internal portal.
 */
const User = require('../../infrastructure/database/models/User');
const Task = require('../../infrastructure/database/models/Task');
const Course = require('../../infrastructure/database/models/Course');
const Feedback = require('../../infrastructure/database/models/Feedback');
const AuditLog = require('../../infrastructure/database/models/AuditLog');
const { hashPassword, comparePassword } = require('../../infrastructure/security/password');
const { generateTokenPair } = require('../../infrastructure/security/jwt');
const catchAsync = require('../../utils/catchAsync');

const loginPage = (req, res) => res.render('admin/login', { error: null });

const loginSubmit = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: 'admin' }).select('+passwordHash');
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return res.render('admin/login', { error: 'Invalid admin credentials' });
  }
  const { accessToken } = generateTokenPair(user);
  res.cookie('adminToken', accessToken, { httpOnly: true, maxAge: 86400000 });
  res.redirect('/admin/dashboard');
});

const dashboard = catchAsync(async (req, res) => {
  const stats = {
    totalUsers: await User.countDocuments({ role: 'user' }),
    totalTasks: await Task.countDocuments(),
    totalCourses: await Course.countDocuments(),
    totalFeedback: await Feedback.countDocuments(),
  };
  const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).lean();
  res.render('admin/dashboard', { stats, recentUsers });
});

const usersPage = catchAsync(async (req, res) => {
  const { search = '' } = req.query;
  const filter = { role: 'user' };
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const users = await User.find(filter).sort({ createdAt: -1 }).lean();
  res.render('admin/users', { users, search });
});

const createUser = catchAsync(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  const passwordHash = await hashPassword(password);
  await User.create({ name, email, passwordHash, role, isVerified: true });
  res.redirect('/admin/users');
});

const updateUser = catchAsync(async (req, res) => {
  const { name, email, role, isVerified } = req.body;
  await User.findByIdAndUpdate(req.params.id, { name, email, role, isVerified: isVerified === 'on' });
  res.redirect('/admin/users');
});

const deleteUser = catchAsync(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/users');
});

const tasksPage = catchAsync(async (req, res) => {
  const { search = '' } = req.query;
  const filter = search ? { title: { $regex: search, $options: 'i' } } : {};
  const tasks = await Task.find(filter).populate('userId', 'name').sort({ createdAt: -1 }).lean();
  const users = await User.find({ role: 'user' }).select('name').lean();
  res.render('admin/tasks', { tasks, users, search });
});

const createTask = catchAsync(async (req, res) => {
  await Task.create(req.body);
  res.redirect('/admin/tasks');
});

const updateTask = catchAsync(async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/admin/tasks');
});

const deleteTask = catchAsync(async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/admin/tasks');
});

const coursesPage = catchAsync(async (req, res) => {
  const { search = '' } = req.query;
  const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
  const courses = await Course.find(filter).populate('userId', 'name').sort({ createdAt: -1 }).lean();
  const users = await User.find({ role: 'user' }).select('name').lean();
  res.render('admin/courses', { courses, users, search });
});

const createCourse = catchAsync(async (req, res) => {
  await Course.create(req.body);
  res.redirect('/admin/courses');
});

const updateCourse = catchAsync(async (req, res) => {
  await Course.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/admin/courses');
});

const deleteCourse = catchAsync(async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.redirect('/admin/courses');
});

const feedbackPage = catchAsync(async (req, res) => {
  const feedback = await Feedback.find().populate('userId', 'name').sort({ createdAt: -1 }).lean();
  res.render('admin/feedback', { feedback });
});

const updateFeedbackStatus = catchAsync(async (req, res) => {
  await Feedback.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.redirect('/admin/feedback');
});

const logsPage = catchAsync(async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).lean();
  res.render('admin/logs', { logs });
});

const logout = (req, res) => {
  res.clearCookie('adminToken');
  res.redirect('/admin/login');
};

module.exports = { 
  loginPage, loginSubmit, dashboard, 
  usersPage, createUser, updateUser, deleteUser,
  tasksPage, createTask, updateTask, deleteTask,
  coursesPage, createCourse, updateCourse, deleteCourse,
  feedbackPage, updateFeedbackStatus,
  logsPage, logout 
};

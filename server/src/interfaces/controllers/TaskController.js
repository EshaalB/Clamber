/**
 * TaskController: Student task management with pagination, filtering, and stats.
 * Handles CRUD operations, status tracking, and dashboard performance metrics.
 */
const Task = require('../../infrastructure/database/models/Task');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { paginateResponse } = require('../../utils/helpers');

const getTasks = catchAsync(async (req, res) => {
  const { page, limit, status, priority, subject, search, sortBy, sortOrder } = req.query;

  const filter = { userId: req.user._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (subject) filter.subject = subject;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limitNum),
    Task.countDocuments(filter),
  ]);

  res.json({
    status: 'success',
    ...paginateResponse(tasks, pageNum, limitNum, total),
  });
});

const createTask = catchAsync(async (req, res) => {
  const task = await Task.create({ ...req.body, userId: req.user._id });

  const { recordActivity } = require('./ActivityController');
  await recordActivity(req.user._id, 'task_created', `Created task: ${task.title}`);

  res.status(201).json({ status: 'success', data: task });
});

const updateTask = catchAsync(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!task) throw ApiError.notFound('Task not found');

  if (req.body.status === 'Done') {
    const { recordActivity } = require('./ActivityController');
    await recordActivity(req.user._id, 'task_completed', `Completed task: ${task.title}`);
  }

  res.json({ status: 'success', data: task });
});

const deleteTask = catchAsync(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isDeleted: true },
    { new: true }
  );

  if (!task) throw ApiError.notFound('Task not found');
  res.json({ status: 'success', message: 'Task deleted' });
});

const getTaskStats = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const [total, completed, inProgress, notStarted] = await Promise.all([
    Task.countDocuments({ userId }),
    Task.countDocuments({ userId, status: 'Done' }),
    Task.countDocuments({ userId, status: 'In Progress' }),
    Task.countDocuments({ userId, status: 'Not Started' }),
  ]);

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const [upcomingDeadlines, todaysTasks] = await Promise.all([
    Task.find({
      userId, dueDate: { $gte: now, $lte: nextWeek }, status: { $ne: 'Done' },
    }).sort({ dueDate: 1 }).limit(5),
    Task.find({
      userId,
      $or: [
        { dueDate: { $gte: new Date(now.setHours(0,0,0,0)), $lte: new Date(now.setHours(23,59,59,999)) } },
        { status: 'In Progress' },
      ],
    }).sort({ priority: -1 }).limit(5)
  ]);

  res.json({
    status: 'success',
    data: {
      total, completed, inProgress, notStarted,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      upcomingDeadlines, todaysTasks,
    },
  });
});

module.exports = { getTasks, createTask, updateTask, deleteTask, getTaskStats };

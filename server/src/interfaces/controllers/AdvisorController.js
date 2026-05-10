/**
 * AdvisorController: Consent-based student wellbeing monitoring for advisors.
 * Provides anonymized risk assessment and workload summaries for linked student accounts.
 */
const User = require('../../infrastructure/database/models/User');
const Analytics = require('../../infrastructure/database/models/Analytics');
const Task = require('../../infrastructure/database/models/Task');
const catchAsync = require('../../utils/catchAsync');

const buildAlias = (id) => `student-${id.toString().slice(-6)}`;

const getDashboard = catchAsync(async (req, res) => {
  if (req.user.role !== 'advisor' && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }

  const advisorEmail = (req.user.email || '').toLowerCase();

  const students = await User.find({
    'settings.advisorAccess.consentEnabled': true,
    'settings.advisorAccess.advisorEmail': advisorEmail,
  }).lean();

  const cards = await Promise.all(students.map(async (student) => {
    const latest = await Analytics.findOne({ userId: student._id }).sort({ date: -1 }).lean();
    const [incomplete, overdue] = await Promise.all([
      Task.countDocuments({ userId: student._id, status: { $ne: 'Done' } }),
      Task.countDocuments({ userId: student._id, status: { $ne: 'Done' }, dueDate: { $lt: new Date() } }),
    ]);

    return {
      studentAlias: buildAlias(student._id),
      riskLevel: latest?.burnoutScore >= 67 ? 'High' : latest?.burnoutScore >= 34 ? 'Medium' : 'Low',
      burnoutScore: latest?.burnoutScore || 0,
      workloadSummary: { incompleteTasks: incomplete, overdueTasks: overdue },
      gradeTrajectory: { targetGPA: student.targetGPA || null, currentTermEstimate: null }
    };
  }));

  res.json({ status: 'success', data: cards });
});

module.exports = { getDashboard };

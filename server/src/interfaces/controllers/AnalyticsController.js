/**
 * AnalyticsController: Wellbeing tracking, burnout scoring, and performance analytics.
 * Aggregates student stress, sleep, and workload data to provide psychological insights.
 */
const Analytics = require('../../infrastructure/database/models/Analytics');
const Task = require('../../infrastructure/database/models/Task');
const User = require('../../infrastructure/database/models/User');
const Notification = require('../../infrastructure/database/models/Notification');
const { encryptJSON } = require('../../infrastructure/security/secureData');
const { calculateBurnoutScore } = require('../../utils/burnout');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const maybeSendAdvisorAlert = async (student, riskLevel, score) => {
  if (riskLevel !== 'High') return;
  const { advisorEmail, consentEnabled } = student.settings?.advisorAccess || {};
  if (!consentEnabled || !advisorEmail) return;

  const advisor = await User.findOne({ email: advisorEmail.toLowerCase() });
  if (!advisor) return;

  const alertKey = `${student._id}-${new Date().toISOString().slice(0, 10)}`;
  const exists = await Notification.findOne({ userId: advisor._id, type: 'burnout_alert', 'metadata.alertKey': alertKey });
  if (exists) return;

  await Notification.create({
    userId: advisor._id, type: 'burnout_alert',
    title: 'Student Burnout Alert',
    message: 'A consented student reached high burnout risk. Review the advisor dashboard.',
    metadata: { alertKey, studentAlias: `student-${student._id.toString().slice(-6)}`, riskLevel, score },
  });
};

const getAnalytics = catchAsync(async (req, res) => {
  const daysNum = parseInt(req.query.days) || 7;
  const startDate = new Date(Date.now() - daysNum * 86400000);

  const analytics = await Analytics.find({ userId: req.user._id, date: { $gte: startDate } }).sort({ date: 1 });
  const count = analytics.length || 1;

  const summary = {
    avgStress: +(analytics.reduce((s, a) => s + a.stressLevel, 0) / count).toFixed(1),
    avgSleep: +(analytics.reduce((s, a) => s + a.sleepHours, 0) / count).toFixed(1),
    totalTasks: analytics.reduce((s, a) => s + a.tasksCompleted, 0),
    totalStudy: +(analytics.reduce((s, a) => s + a.studyHours, 0)).toFixed(1),
  };

  const insights = [];
  if (summary.avgStress >= 70) insights.push('Stress levels are consistently high.');
  if (summary.avgSleep < 6.5) insights.push('Sleep deficit detected; productivity may be impacted.');
  if (summary.avgStress >= 65 && summary.avgSleep < 6.5) insights.push('Workload/wellbeing correlation identified: high stress and low sleep.');
  if (!insights.length) insights.push('Your current workload and wellbeing trend appears balanced.');

  res.json({ status: 'success', data: { summary, history: analytics, insights } });
});

const recordAnalytics = catchAsync(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [completed, upcoming, missed, incomplete, highPri] = await Promise.all([
    Task.countDocuments({ userId: req.user._id, status: 'Done', updatedAt: { $gte: today } }),
    Task.countDocuments({ userId: req.user._id, dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 604800000) }, status: { $ne: 'Done' } }),
    Task.countDocuments({ userId: req.user._id, dueDate: { $lt: new Date() }, status: { $ne: 'Done' } }),
    Task.countDocuments({ userId: req.user._id, status: { $ne: 'Done' } }),
    Task.countDocuments({ userId: req.user._id, status: { $ne: 'Done' }, priority: 'High' })
  ]);

  const workloadIntensity = Math.min(100, (incomplete * 8) + (highPri * 12));
  const { stressLevel = 0, sleepHours = 7, studyHours = 0, factors = {} } = req.body;

  const computed = calculateBurnoutScore({ workloadIntensity, sleepHours, stressLevel, upcomingDeadlines: upcoming, missedTasks: missed });

  const analyticsData = {
    userId: req.user._id, date: today, stressLevel, sleepHours, studyHours,
    tasksCompleted: completed, burnoutScore: computed.score, factors: computed.factors,
    encryptedWellness: encryptJSON({ stressLevel, sleepHours, studyHours, timestamp: new Date().toISOString() })
  };

  const analytics = await Analytics.findOneAndUpdate({ userId: req.user._id, date: today }, analyticsData, { upsert: true, new: true, runValidators: true });
  res.json({ status: 'success', data: analytics });
});

const getBurnoutScore = catchAsync(async (req, res) => {
  const daysNum = [7, 30, 90].includes(parseInt(req.query.days)) ? parseInt(req.query.days) : 7;
  const user = req.user;

  const periodStart = new Date(Date.now() - daysNum * 86400000);
  const trendData = await Analytics.find({ userId: user._id, date: { $gte: periodStart } }).sort({ date: 1 });

  const [highPri, totalInc, upcoming, missed] = await Promise.all([
    Task.countDocuments({ userId: user._id, priority: 'High', status: { $ne: 'Done' } }),
    Task.countDocuments({ userId: user._id, status: { $ne: 'Done' } }),
    Task.countDocuments({ userId: user._id, dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 604800000) }, status: { $ne: 'Done' } }),
    Task.countDocuments({ userId: user._id, dueDate: { $lt: new Date() }, status: { $ne: 'Done' } })
  ]);

  const workloadScore = Math.min(100, (totalInc * 10) + (highPri * 15));
  const computed = calculateBurnoutScore({ workloadIntensity: workloadScore, sleepHours: user.sleepHours || 7, stressLevel: (user.stressLevel || 3) * 15, upcomingDeadlines: upcoming, missedTasks: missed });

  await maybeSendAdvisorAlert(user, computed.riskLevel, computed.score);

  const warnings = [];
  if (highPri > 3) warnings.push('Excessive high-priority tasks are active.');
  if (user.sleepHours < 6) warnings.push('Severe sleep deficit detected.');
  if (computed.score >= 67) warnings.push('Critical burnout risk. Prioritize recovery.');

  const suggestions = ['Take a 15-20 min break every 90 mins.', 'Redistribute non-urgent tasks.'];
  if (computed.riskLevel === 'High') suggestions.push('Contact support or a trusted advisor today.');

  const trend = trendData.map(e => ({
    date: e.date, score: e.burnoutScore, stressLevel: e.stressLevel, sleepHours: e.sleepHours,
    annotation: (e.factors?.workload || 0) >= 70 ? 'High workload' : ''
  }));

  res.json({
    status: 'success',
    data: {
      score: computed.score, riskLevel: computed.riskLevel, factors: computed.factors,
      warnings, suggestions, stressLevel: user.stressLevel, trend,
      crisisPrompt: computed.riskLevel === 'High' ? {
        title: 'Immediate Support Available',
        text: 'You are not alone. Reach out to these resources:',
        contacts: [
          { label: 'University Counseling', url: 'https://university.edu/counseling' },
          { label: 'Crisis Text Line', url: 'sms:741741' },
          { label: 'Mental Health Helpline', url: 'tel:988' }
        ]
      } : null
    }
  });
});

module.exports = { getAnalytics, recordAnalytics, getBurnoutScore };

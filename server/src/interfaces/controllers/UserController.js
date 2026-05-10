/**
 * UserController: Profile, settings, onboarding, and account management.
 * Handles deep settings synchronization, avatar uploads, and personal data exports.
 */
const User = require('../../infrastructure/database/models/User');
const Course = require('../../infrastructure/database/models/Course');
const Session = require('../../infrastructure/database/models/Session');
const Task = require('../../infrastructure/database/models/Task');
const Analytics = require('../../infrastructure/database/models/Analytics');
const Notification = require('../../infrastructure/database/models/Notification');
const { sanitizeUser } = require('../../utils/helpers');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');

  const courses = await Course.find({ userId: req.user._id });
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  res.json({
    status: 'success',
    data: {
      ...sanitizeUser(user),
      courseCount: courses.length,
      totalCredits,
    },
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) throw ApiError.notFound('User not found');

  res.json({
    status: 'success',
    data: sanitizeUser(user),
  });
});

const updateSettings = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');

  const newSettings = { ...user.settings.toObject?.() || user.settings };

  // Personalization
  if (req.body.theme !== undefined) newSettings.theme = req.body.theme;
  if (req.body.accentColor !== undefined) newSettings.accentColor = req.body.accentColor;
  if (req.body.fontSize !== undefined) newSettings.fontSize = req.body.fontSize;
  if (req.body.language !== undefined) newSettings.language = req.body.language;
  
  // Audio & Notifications
  if (req.body.soundEnabled !== undefined) newSettings.soundEnabled = req.body.soundEnabled;
  if (req.body.volume !== undefined) newSettings.volume = req.body.volume;
  if (req.body.notifications) {
    newSettings.notifications = { ...newSettings.notifications, ...req.body.notifications };
  }

  // Prayer & Schedule Logic
  if (req.body.prayerTimes) {
    const updatedPrayerTimes = { ...newSettings.prayerTimes, ...req.body.prayerTimes };
    newSettings.prayerTimes = updatedPrayerTimes;

    if (updatedPrayerTimes.mode === 'auto' || req.body.prayerTimes.fajr) {
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const prayerBlockedPeriods = [];
      
      for (let day = 0; day < 7; day++) {
        prayers.forEach(p => {
          const time = updatedPrayerTimes[p];
          if (time) {
            const [h, m] = time.split(':').map(Number);
            const endH = m >= 30 ? h + 1 : h;
            const endM = (m + 30) % 60;
            const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
            
            prayerBlockedPeriods.push({
              dayOfWeek: day,
              startTime: time,
              endTime,
              label: `Prayer: ${p.charAt(0).toUpperCase() + p.slice(1)}`,
              isAuto: true
            });
          }
        });
      }
      const manualPeriods = (newSettings.blockedTimePeriods || []).filter(p => !p.isAuto);
      newSettings.blockedTimePeriods = [...manualPeriods, ...prayerBlockedPeriods];
    }
  }

  if (req.body.blockedTimePeriods) newSettings.blockedTimePeriods = req.body.blockedTimePeriods;
  
  if (req.body.advisorAccess) {
    const nextAccess = { ...newSettings.advisorAccess, ...req.body.advisorAccess };
    if (!nextAccess.consentEnabled) nextAccess.advisorEmail = '';
    newSettings.advisorAccess = nextAccess;
  }

  user.settings = newSettings;
  await user.save();

  res.json({
    status: 'success',
    data: { settings: user.settings },
  });
});

const completeOnboarding = catchAsync(async (req, res) => {
  const {
    name, year, major, courses, targetGPA,
    studyPreference, breakPreference, sleepHours,
    stressLevel, commitments,
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');

  Object.assign(user, {
    name: name || user.name,
    year: year || user.year,
    major: major || user.major,
    targetGPA: targetGPA || user.targetGPA,
    studyPreference: studyPreference || user.studyPreference,
    breakPreference: breakPreference || user.breakPreference,
    sleepHours: sleepHours || user.sleepHours,
    stressLevel: stressLevel || user.stressLevel,
    onboardingCompleted: true
  });

  if (commitments) user.commitments = { ...user.commitments, ...commitments };
  await user.save();

  if (courses?.length > 0) {
    const courseData = courses.map(c => ({
      userId: user._id,
      name: c.name,
      credits: c.credits,
      targetGrade: 80,
    }));
    await Course.insertMany(courseData);
  }

  res.json({
    status: 'success',
    message: 'Onboarding completed',
    data: sanitizeUser(user),
  });
});

const deleteAccount = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isDeleted: true });
  await Session.deleteMany({ userId: req.user._id });

  res.json({
    status: 'success',
    message: 'Account deleted successfully',
  });
});

const updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Please upload an image');

  const dataURI = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: dataURI }, { new: true });

  res.json({
    status: 'success',
    data: { avatar: user.avatar },
  });
});

const exportPersonalData = catchAsync(async (req, res) => {
  const [user, courses, tasks, analytics, notifications] = await Promise.all([
    User.findById(req.user._id),
    Course.find({ userId: req.user._id }),
    Task.find({ userId: req.user._id }),
    Analytics.find({ userId: req.user._id }).sort({ date: -1 }),
    Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }),
  ]);

  res.json({
    status: 'success',
    data: {
      exportedAt: new Date().toISOString(),
      user: sanitizeUser(user),
      courses,
      tasks,
      analytics,
      notifications,
    },
  });
});

module.exports = {
  getProfile,
  updateProfile,
  updateSettings,
  completeOnboarding,
  deleteAccount,
  updateAvatar,
  exportPersonalData,
};

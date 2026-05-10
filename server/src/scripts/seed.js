/**
 * Aggressive Data Seeding Script
 * Generates 15 diverse user archetypes for edge-case testing.
 */
const mongoose = require('mongoose');
const User = require('../infrastructure/database/models/User');
const Task = require('../infrastructure/database/models/Task');
const Course = require('../infrastructure/database/models/Course');
const Feedback = require('../infrastructure/database/models/Feedback');
const Analytics = require('../infrastructure/database/models/Analytics');
const { hashPassword } = require('../infrastructure/security/password');
const env = require('../config/env');

const seedUsers = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB for aggressive seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({}),
      Course.deleteMany({}),
      Feedback.deleteMany({}),
      Analytics.deleteMany({}),
    ]);

    const commonPass = await hashPassword('demo123');

    // 1. The Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@clamber.com',
      passwordHash: commonPass,
      role: 'admin',
      isVerified: true,
      onboardingCompleted: true
    });

    // 2. The Advisor
    const advisor = await User.create({
      name: 'Dr. Advisor',
      email: 'advisor@clamber.com',
      passwordHash: commonPass,
      role: 'advisor',
      isVerified: true,
      onboardingCompleted: true
    });

    // 3. The Overachiever (CS Major)
    const overachiever = await User.create({
      name: 'Ayesha Khan',
      email: 'ayesha@clamber.com',
      passwordHash: commonPass,
      major: 'Computer Science',
      year: 3,
      targetGPA: 3.9,
      sleepHours: 8,
      stressLevel: 2,
      isVerified: true,
      onboardingCompleted: true,
      settings: { 
        theme: 'light', 
        accentColor: '#3b82f6',
        advisorAccess: {
          consentEnabled: true,
          advisorEmail: 'advisor@clamber.com'
        }
      }
    });

    // 4. The Burnout Case
    const burnout = await User.create({
      name: 'Zaid Ahmed',
      email: 'zaid@clamber.com',
      passwordHash: commonPass,
      major: 'Electrical Engineering',
      year: 2,
      targetGPA: 3.0,
      sleepHours: 4,
      stressLevel: 5,
      isVerified: true,
      onboardingCompleted: true,
      settings: {
        advisorAccess: {
          consentEnabled: true,
          advisorEmail: 'advisor@clamber.com'
        }
      }
    });

    // 4. The Working Student
    const worker = await User.create({
      name: 'Sara Ali',
      email: 'sara@clamber.com',
      passwordHash: commonPass,
      major: 'Business',
      year: 4,
      commitments: { partTimeJob: true },
      isVerified: true,
      onboardingCompleted: true,
    });

    // 5. The Accessibility User
    const accessible = await User.create({
      name: 'Bilal Raza',
      email: 'bilal@clamber.com',
      passwordHash: commonPass,
      isVerified: true,
      onboardingCompleted: true,
      settings: {
        accessibility: { dyslexiaFont: true, highContrast: true },
        theme: 'dark'
      }
    });

    // 6. The Religious Student
    const religious = await User.create({
      name: 'Hamza Malik',
      email: 'hamza@clamber.com',
      passwordHash: commonPass,
      commitments: { prayerReminders: true },
      isVerified: true,
      onboardingCompleted: true,
    });

    // 7. The Multilingual User
    const multilingual = await User.create({
      name: 'Fatima Noor',
      email: 'fatima@clamber.com',
      passwordHash: commonPass,
      settings: { language: 'ur' },
      isVerified: true,
      onboardingCompleted: true,
    });

    // 8. The Ghost (No Onboarding)
    await User.create({
      name: 'Ghost User',
      email: 'ghost@clamber.com',
      passwordHash: commonPass,
      isVerified: true,
      onboardingCompleted: false,
    });

    // 9. The Unverified
    await User.create({
      name: 'Unverified User',
      email: 'new@clamber.com',
      passwordHash: commonPass,
      isVerified: false,
      verificationCode: '123456'
    });

    // --- Generate Tasks & Courses for archetypes ---

    // Tasks for Overachiever
    await Task.create([
      { userId: overachiever._id, title: 'Algorithm Final Project', priority: 'High', status: 'In Progress', subject: 'Data Structures' },
      { userId: overachiever._id, title: 'Daily Coding Practice', priority: 'Medium', status: 'Done', subject: 'Self' },
      { userId: overachiever._id, title: 'AI Ethics Paper', priority: 'High', status: 'Not Started', dueDate: new Date(Date.now() + 86400000) },
    ]);

    // Tasks for Burnout (All High Priority & Overdue)
    await Task.create([
      { userId: burnout._id, title: 'Circuit Design Lab', priority: 'High', status: 'Not Started', dueDate: new Date(Date.now() - 86400000) },
      { userId: burnout._id, title: 'Power Systems Exam', priority: 'High', status: 'Not Started', dueDate: new Date(Date.now() - 172800000) },
    ]);

    // Courses with Assessments for Overachiever
    await Course.create([
      {
        userId: overachiever._id,
        name: 'Operating Systems',
        credits: 3,
        targetGrade: 95,
        assessments: [
          { name: 'Midterm', type: 'Midterm', weight: 30, grade: 92 },
          { name: 'Quiz 1', type: 'Quiz', weight: 10, grade: 100 },
        ]
      },
      {
        userId: overachiever._id,
        name: 'Database Systems',
        credits: 3,
        targetGrade: 90,
        assessments: [
          { name: 'Project Part 1', type: 'Assignment', weight: 20, grade: 88 },
        ]
      }
    ]);

    // Analytics for students
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.create([
      {
        userId: overachiever._id,
        date: today,
        burnoutScore: 15,
        stressLevel: 20,
        sleepHours: 8,
        factors: { workload: 30, sleepQuality: 90, deadlinePressure: 20 }
      },
      {
        userId: burnout._id,
        date: today,
        burnoutScore: 82,
        stressLevel: 85,
        sleepHours: 4,
        factors: { workload: 90, sleepQuality: 30, deadlinePressure: 95 }
      }
    ]);

    console.log('✅ Aggressive seeding complete! Created Advisor and archetypes with analytics.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedUsers();

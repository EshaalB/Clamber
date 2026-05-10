const mongoose = require('mongoose');
const User = require('../infrastructure/database/models/User');
const Task = require('../infrastructure/database/models/Task');
const Course = require('../infrastructure/database/models/Course');
const Analytics = require('../infrastructure/database/models/Analytics');
const { hashPassword } = require('../infrastructure/security/password');
const env = require('../config/env');

const seedVeteranUser = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB for historical seeding...');

    // Find and clear veteran if exists
    let veteran = await User.findOne({ email: 'veteran@clamber.com' });
    if (veteran) {
      await Promise.all([
        User.deleteOne({ _id: veteran._id }),
        Task.deleteMany({ userId: veteran._id }),
        Course.deleteMany({ userId: veteran._id }),
        Analytics.deleteMany({ userId: veteran._id }),
      ]);
      console.log('Cleared existing veteran data.');
    }

    const commonPass = await hashPassword('demo123');

    veteran = await User.create({
      name: 'Veteran User',
      email: 'veteran@clamber.com',
      passwordHash: commonPass,
      major: 'Software Engineering',
      year: 3,
      targetGPA: 3.8,
      sleepHours: 7,
      stressLevel: 4,
      isVerified: true,
      onboardingCompleted: true,
      settings: { 
        theme: 'dark', 
        accentColor: '#8b5cf6',
      }
    });

    console.log(`Created Veteran User (ID: ${veteran._id})`);

    // Create Historical Analytics Data for the past 90 days
    const analyticsEntries = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let currentStress = 40;
    let currentSleep = 7.5;
    let currentBurnout = 30;

    for (let i = 90; i >= 0; i--) {
      const pastDate = new Date(now);
      pastDate.setDate(now.getDate() - i);
      
      // Random walk for realistic trends
      // Midterms around day 45 (i.e. i=45) causes spike
      if (i > 40 && i < 50) {
        currentStress = Math.min(100, currentStress + (Math.random() * 10));
        currentSleep = Math.max(3, currentSleep - (Math.random() * 1.5));
        currentBurnout = Math.min(100, currentBurnout + (Math.random() * 8));
      } else {
        // Normal drift towards baseline
        currentStress += (Math.random() * 10 - 5) + (40 - currentStress) * 0.1;
        currentSleep += (Math.random() * 2 - 1) + (7.5 - currentSleep) * 0.1;
        currentBurnout += (Math.random() * 10 - 5) + (30 - currentBurnout) * 0.1;
      }

      // Bound values
      currentStress = Math.max(0, Math.min(100, currentStress));
      currentSleep = Math.max(0, Math.min(12, currentSleep));
      currentBurnout = Math.max(0, Math.min(100, currentBurnout));

      analyticsEntries.push({
        userId: veteran._id,
        date: pastDate,
        burnoutScore: Math.round(currentBurnout),
        stressLevel: Math.round(currentStress),
        sleepHours: Number(currentSleep.toFixed(1)),
        tasksCompleted: Math.floor(Math.random() * 5),
        studyHours: Number((Math.random() * 4).toFixed(1)),
        factors: { 
          workload: Math.round(Math.random() * 100), 
          sleepQuality: Math.round(currentSleep / 12 * 100), 
          deadlinePressure: Math.round(currentStress * 0.8) 
        }
      });
    }

    await Analytics.insertMany(analyticsEntries);
    console.log(`Seeded ${analyticsEntries.length} days of analytics history.`);

    // Add some realistic courses
    await Course.create([
      {
        userId: veteran._id,
        name: 'Advanced Web Development',
        credits: 4,
        targetGrade: 90,
        currentGrade: 88,
        status: 'On Track',
        assessments: [
          { name: 'Midterm', type: 'Midterm', weight: 30, grade: 85 },
          { name: 'React Project', type: 'Assignment', weight: 20, grade: 92 },
        ]
      },
      {
        userId: veteran._id,
        name: 'Cloud Computing Architecture',
        credits: 3,
        targetGrade: 85,
        currentGrade: 78,
        status: 'Slight Risk',
        assessments: [
          { name: 'AWS Lab 1', type: 'Assignment', weight: 15, grade: 75 },
          { name: 'Midterm Exam', type: 'Midterm', weight: 35, grade: 79 },
        ]
      }
    ]);

    // Add some tasks
    await Task.create([
      { userId: veteran._id, title: 'Final Project Deployment', priority: 'High', status: 'In Progress', subject: 'Advanced Web Development', dueDate: new Date(Date.now() + 2 * 86400000) },
      { userId: veteran._id, title: 'Study for Cloud Quiz', priority: 'Medium', status: 'Not Started', subject: 'Cloud Computing Architecture', dueDate: new Date(Date.now() + 1 * 86400000) },
      { userId: veteran._id, title: 'Read Chapter 7', priority: 'Low', status: 'Done', subject: 'Self' },
    ]);

    console.log('✅ Veteran user seeding complete!');
    console.log('Login credentials:');
    console.log('Email: veteran@clamber.com');
    console.log('Password: demo123');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedVeteranUser();

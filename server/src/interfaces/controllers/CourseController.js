/**
 * CourseController: Academic record management and GPA projections.
 * Handles course CRUD, assessment weight calculations, and 4.0 scale conversions.
 */
const Course = require('../../infrastructure/database/models/Course');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const getCourses = catchAsync(async (req, res) => {
  const courses = await Course.find({ userId: req.user._id }).sort({ name: 1 });
  res.json({ status: 'success', data: courses });
});

const createCourse = catchAsync(async (req, res) => {
  const course = await Course.create({ ...req.body, userId: req.user._id });

  const { recordActivity } = require('./ActivityController');
  await recordActivity(req.user._id, 'course_added', `Added course: ${course.name}`);

  res.status(201).json({ status: 'success', data: course });
});

const updateCourse = catchAsync(async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!course) throw ApiError.notFound('Course not found');

  if (course.assessments) {
    let totalWeightedGrade = 0;
    let gradedWeight = 0;

    course.assessments.forEach(as => {
      if (as.grade !== null && as.grade !== undefined) {
        totalWeightedGrade += (as.grade * as.weight);
        gradedWeight += as.weight;
      }
    });

    course.currentGrade = gradedWeight > 0 ? Math.round(totalWeightedGrade / gradedWeight) : 0;
    
    const target = course.targetGrade || 80;
    const remainingWeight = 100 - gradedWeight;
    const currentContribution = totalWeightedGrade / 100;

    if (remainingWeight > 0) {
      const rawRequired = ((target - currentContribution) * 100) / remainingWeight;
      course.requiredAverage = Math.max(0, Math.min(100, Math.round(rawRequired)));
      
      if (rawRequired > 100) {
        course.status = 'At Risk';
        course.revisedTarget = Math.floor(currentContribution + (remainingWeight / 100 * 100));
      } else {
        course.revisedTarget = null;
        course.status = course.requiredAverage > 90 ? 'At Risk' :
                        course.requiredAverage > course.currentGrade ? 'Slight Risk' : 'On Track';
      }
    } else {
      course.requiredAverage = 0;
      course.revisedTarget = null;
      course.status = course.currentGrade >= target ? 'On Track' : 'At Risk';
    }
    
    course.markModified('assessments');
    const oldStatus = course.status;
    await course.save();

    if (course.status !== oldStatus || course.revisedTarget) {
      const { createNotification } = require('./NotificationController');
      await createNotification(req.user._id, {
        title: `Grade Update: ${course.name}`,
        message: course.revisedTarget 
          ? `Your target was adjusted to ${course.revisedTarget}% (max possible).`
          : `Status changed to ${course.status}. Required average: ${course.requiredAverage}%.`,
        type: course.status === 'At Risk' ? 'warning' : 'info',
        link: '/grade-planner'
      });
    }
  }

  res.json({ status: 'success', data: course });
});

const deleteCourse = catchAsync(async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isDeleted: true },
    { new: true }
  );

  if (!course) throw ApiError.notFound('Course not found');
  res.json({ status: 'success', message: 'Course deleted' });
});

const getGPA = catchAsync(async (req, res) => {
  const courses = await Course.find({ userId: req.user._id });

  const gradeToGPA = (p) => {
    if (p >= 90) return 4.0; if (p >= 85) return 3.7; if (p >= 80) return 3.3;
    if (p >= 75) return 3.0; if (p >= 70) return 2.7; if (p >= 65) return 2.3;
    if (p >= 60) return 2.0; if (p >= 55) return 1.7; if (p >= 50) return 1.0;
    return 0.0;
  };

  let totalQP = 0, totalCr = 0;
  const courseDetails = courses.map(c => {
    const gpa = gradeToGPA(c.currentGrade);
    totalQP += gpa * c.credits;
    totalCr += c.credits;
    return {
      name: c.name, credits: c.credits, currentGrade: c.currentGrade,
      targetGrade: c.targetGrade, requiredAverage: c.requiredAverage,
      status: c.status, gpa
    };
  });

  const currentGPA = totalCr > 0 ? +(totalQP / totalCr).toFixed(2) : 0;
  const targetGPA = req.user.targetGPA || 3.5;

  res.json({
    status: 'success',
    data: {
      currentGPA, targetGPA,
      gpaGap: +(targetGPA - currentGPA).toFixed(2),
      totalCredits: totalCr,
      courses: courseDetails,
    },
  });
});

module.exports = { getCourses, createCourse, updateCourse, deleteCourse, getGPA };

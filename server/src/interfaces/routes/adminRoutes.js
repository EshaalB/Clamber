/**
 * Admin Routes
 * EJS-rendered admin panel with full CRUD.
 */
const router = require('express').Router();
const AdminController = require('../controllers/AdminController');
const { verifyAccessToken } = require('../../infrastructure/security/jwt');
const User = require('../../infrastructure/database/models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;
    if (!token) return res.redirect('/admin/login');
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') return res.redirect('/admin/login');
    req.adminUser = user;
    next();
  } catch (err) {
    res.clearCookie('adminToken');
    res.redirect('/admin/login');
  }
};

router.get('/login', AdminController.loginPage);
router.post('/login', AdminController.loginSubmit);

router.get('/dashboard', adminAuth, AdminController.dashboard);

// Users
router.get('/users', adminAuth, AdminController.usersPage);
router.post('/users', adminAuth, AdminController.createUser);
router.post('/users/:id', adminAuth, AdminController.updateUser);
router.post('/users/:id/delete', adminAuth, AdminController.deleteUser);

// Tasks
router.get('/tasks', adminAuth, AdminController.tasksPage);
router.post('/tasks', adminAuth, AdminController.createTask);
router.post('/tasks/:id', adminAuth, AdminController.updateTask);
router.post('/tasks/:id/delete', adminAuth, AdminController.deleteTask);

// Courses
router.get('/courses', adminAuth, AdminController.coursesPage);
router.post('/courses', adminAuth, AdminController.createCourse);
router.post('/courses/:id', adminAuth, AdminController.updateCourse);
router.post('/courses/:id/delete', adminAuth, AdminController.deleteCourse);

// Feedback
router.get('/feedback', adminAuth, AdminController.feedbackPage);
router.post('/feedback/:id/status', adminAuth, AdminController.updateFeedbackStatus);

router.get('/logs', adminAuth, AdminController.logsPage);
router.get('/logout', adminAuth, AdminController.logout);

router.get('/', (req, res) => res.redirect('/admin/dashboard'));

module.exports = router;

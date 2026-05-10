const express = require('express');
const adminController = require('../../controllers/AdminApiController');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');

const router = express.Router();

// All routes here are restricted to admins
router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/logs', adminController.getLogs);
router.post('/users/:id/promote', adminController.promoteToAdvisor);
router.post('/users/:id/reset-password', adminController.resetPassword);
router.post('/users/:id/verify', adminController.verifyUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/users/:id/activity', adminController.getUserActivity);

// Bulk Actions
router.post('/users/bulk-verify', adminController.bulkVerify);
router.post('/users/bulk-delete', adminController.bulkDelete);

// System Settings
router.get('/settings', adminController.getSystemSettings);
router.patch('/settings', adminController.updateSystemSettings);

module.exports = router;

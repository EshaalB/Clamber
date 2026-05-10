/**
 * API v1 Route Aggregator
 */
const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/tasks', require('./taskRoutes'));
router.use('/courses', require('./courseRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/ai', require('./aiRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/activities', require('./activityRoutes'));
router.use('/advisor', require('./advisorRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;

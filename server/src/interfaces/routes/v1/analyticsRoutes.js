/**
 * Analytics Routes
 */
const router = require('express').Router();
const AnalyticsController = require('../../controllers/AnalyticsController');
const authenticate = require('../../middlewares/authenticate');

router.use(authenticate);

router.get('/', AnalyticsController.getAnalytics);
router.post('/', AnalyticsController.recordAnalytics);
router.get('/burnout', AnalyticsController.getBurnoutScore);

module.exports = router;

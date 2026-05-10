/**
 * Advisor Routes
 */
const router = require('express').Router();
const AdvisorController = require('../../controllers/AdvisorController');
const authenticate = require('../../middlewares/authenticate');

router.use(authenticate);
router.get('/dashboard', AdvisorController.getDashboard);

module.exports = router;

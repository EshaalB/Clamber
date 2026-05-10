const router = require('express').Router();
const { getActivities } = require('../../controllers/ActivityController');
const authenticate = require('../../middlewares/authenticate');

router.use(authenticate);

router.get('/', getActivities);

module.exports = router;

const express = require('express');
const notificationController = require('../../controllers/NotificationController');
const authenticate = require('../../middlewares/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;

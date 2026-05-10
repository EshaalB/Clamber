/**
 * User Routes
 */
const router = require('express').Router();
const UserController = require('../../controllers/UserController');
const authenticate = require('../../middlewares/authenticate');
const validate = require('../../middlewares/validate');
const auditLog = require('../../middlewares/auditLog');
const { updateProfileSchema, updateSettingsSchema, onboardingSchema } = require('../../validators/userValidator');
const { upload } = require('../../../infrastructure/external-services/UploadService');

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.get('/export', UserController.exportPersonalData);
router.put('/profile', validate(updateProfileSchema), auditLog('UPDATE_PROFILE'), UserController.updateProfile);
router.patch('/avatar', upload.single('avatar'), auditLog('UPDATE_AVATAR'), UserController.updateAvatar);
router.put('/settings', validate(updateSettingsSchema), auditLog('UPDATE_SETTINGS'), UserController.updateSettings);
router.post('/onboarding', validate(onboardingSchema), auditLog('COMPLETE_ONBOARDING'), UserController.completeOnboarding);
router.delete('/account', auditLog('DELETE_ACCOUNT'), UserController.deleteAccount);

module.exports = router;

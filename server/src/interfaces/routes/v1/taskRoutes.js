/**
 * Task Routes
 */
const router = require('express').Router();
const TaskController = require('../../controllers/TaskController');
const authenticate = require('../../middlewares/authenticate');
const validate = require('../../middlewares/validate');
const auditLog = require('../../middlewares/auditLog');
const { createTaskSchema, updateTaskSchema, taskQuerySchema } = require('../../validators/taskValidator');

router.use(authenticate);

router.get('/', validate(taskQuerySchema, 'query'), TaskController.getTasks);
router.get('/stats', TaskController.getTaskStats);
router.post('/', validate(createTaskSchema), auditLog('CREATE_TASK'), TaskController.createTask);
router.put('/:id', validate(updateTaskSchema), TaskController.updateTask);
router.delete('/:id', auditLog('DELETE_TASK'), TaskController.deleteTask);

module.exports = router;

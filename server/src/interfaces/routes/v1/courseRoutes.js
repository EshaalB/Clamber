/**
 * Course Routes
 */
const router = require('express').Router();
const CourseController = require('../../controllers/CourseController');
const authenticate = require('../../middlewares/authenticate');
const validate = require('../../middlewares/validate');
const { createCourseSchema, updateCourseSchema } = require('../../validators/courseValidator');

router.use(authenticate);

router.get('/', CourseController.getCourses);
router.get('/gpa', CourseController.getGPA);
router.post('/', validate(createCourseSchema), CourseController.createCourse);
router.put('/:id', validate(updateCourseSchema), CourseController.updateCourse);
router.delete('/:id', CourseController.deleteCourse);

module.exports = router;

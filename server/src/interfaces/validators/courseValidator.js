/**
 * Course Validators
 */
const Joi = require('joi');

const createCourseSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required(),
  credits: Joi.number().integer().min(1).max(6).required(),
  currentGrade: Joi.number().min(0).max(100).default(0),
  targetGrade: Joi.number().min(0).max(100).default(80),
  assessments: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('Assignment', 'Quiz', 'Midterm', 'Final', 'Other').default('Assignment'),
    weight: Joi.number().min(0).max(100).required(),
    grade: Joi.number().min(0).max(100).allow(null),
  })),
});

const updateCourseSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150),
  credits: Joi.number().integer().min(1).max(6),
  currentGrade: Joi.number().min(0).max(100),
  targetGrade: Joi.number().min(0).max(100),
  assessments: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('Assignment', 'Quiz', 'Midterm', 'Final', 'Other').default('Assignment'),
    weight: Joi.number().min(0).max(100).required(),
    grade: Joi.number().min(0).max(100).allow(null),
  })),
}).min(1);

module.exports = { createCourseSchema, updateCourseSchema };

/**
 * Task Validators
 */
const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  dueDate: Joi.date().iso().allow(null, ''),
  status: Joi.string().valid('Not Started', 'In Progress', 'Done').default('Not Started'),
  priority: Joi.string().valid('High', 'Medium', 'Low').default('Medium'),
  subject: Joi.string().trim().max(100).default('General'),
  description: Joi.string().trim().max(1000).allow(''),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  dueDate: Joi.date().iso().allow(null, ''),
  status: Joi.string().valid('Not Started', 'In Progress', 'Done'),
  priority: Joi.string().valid('High', 'Medium', 'Low'),
  subject: Joi.string().trim().max(100),
  description: Joi.string().trim().max(1000).allow(''),
}).min(1);

const taskQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('Not Started', 'In Progress', 'Done'),
  priority: Joi.string().valid('High', 'Medium', 'Low'),
  subject: Joi.string().trim(),
  search: Joi.string().trim(),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'priority', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = { createTaskSchema, updateTaskSchema, taskQuerySchema };

const { z } = require('zod');

const createJobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  description: z.string().min(10, 'Job description must be at least 10 characters'),
  roleType: z.string().optional().default('Full-time'),
  packageCtc: z.number().positive('Package CTC must be a positive number (LPA)').optional(),
  location: z.string().optional().default('Remote / Hybrid'),
  minCgpa: z.number().min(0.0).max(10.0).default(0.0),
  allowedDepartments: z.string().min(1, 'Allowed departments are required (e.g. "Computer Science,Electronics" or "All")'),
  maxBacklogs: z.number().int().min(0).default(0),
  deadline: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid deadline date format'
  })
});

const updateJobSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  roleType: z.string().optional(),
  packageCtc: z.number().positive().optional(),
  location: z.string().optional(),
  minCgpa: z.number().min(0.0).max(10.0).optional(),
  allowedDepartments: z.string().min(1).optional(),
  maxBacklogs: z.number().int().min(0).optional(),
  deadline: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid deadline date format'
  }).optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional()
});

module.exports = {
  createJobSchema,
  updateJobSchema
};

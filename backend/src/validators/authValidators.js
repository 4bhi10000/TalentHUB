const { z } = require('zod');

const registerStudentSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name is required'),
  rollNumber: z.string().min(2, 'Roll number / USN is required'),
  department: z.string().min(2, 'Department is required'),
  cgpa: z.number().min(0.0).max(10.0, 'CGPA must be between 0.0 and 10.0'),
  graduationYear: z.number().int().min(2020).max(2035, 'Valid graduation year is required'),
  activeBacklogs: z.number().int().min(0).default(0),
  phone: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  skills: z.string().optional()
});

const registerCompanySchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(2, 'Industry is required'),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  location: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

const updateStudentProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  department: z.string().min(2).optional(),
  cgpa: z.number().min(0.0).max(10.0).optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  activeBacklogs: z.number().int().min(0).optional(),
  phone: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  skills: z.string().optional()
});

const updateCompanyProfileSchema = z.object({
  companyName: z.string().min(2).optional(),
  industry: z.string().min(2).optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  location: z.string().optional()
});

module.exports = {
  registerStudentSchema,
  registerCompanySchema,
  loginSchema,
  updateStudentProfileSchema,
  updateCompanyProfileSchema
};

const { z } = require('zod');

const applyJobSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  remarks: z.string().optional()
});

const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be one of: APPLIED, SHORTLISTED, INTERVIEW, OFFERED, HIRED, REJECTED' })
  }),
  remarks: z.string().optional()
});

module.exports = {
  applyJobSchema,
  updateApplicationStatusSchema
};

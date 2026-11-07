const { z } = require('zod');

const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  roundName: z.string().min(2, 'Round name is required (e.g. Technical Round 1)'),
  scheduledDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Valid scheduled date/time is required'
  }),
  mode: z.enum(['ONLINE', 'OFFLINE']).default('ONLINE'),
  venueOrLink: z.string().optional()
});

const updateInterviewSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  feedback: z.string().optional(),
  result: z.enum(['CLEARED', 'FAILED', 'PENDING']).optional(),
  venueOrLink: z.string().optional()
});

module.exports = {
  scheduleInterviewSchema,
  updateInterviewSchema
};

const { z } = require('zod');

const issueOfferSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  ctc: z.number().positive('CTC must be a positive number in LPA'),
  designation: z.string().min(2, 'Job designation/title is required'),
  joiningDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid joining date'
  }),
  offerLetterUrl: z.string().url().optional().or(z.literal('')),
  deadline: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid deadline date'
  }),
  remarks: z.string().optional()
});

const respondOfferSchema = z.object({
  decision: z.enum(['ACCEPTED', 'REJECTED'], {
    errorMap: () => ({ message: 'Decision must be either ACCEPTED or REJECTED' })
  }),
  remarks: z.string().optional()
});

module.exports = {
  issueOfferSchema,
  respondOfferSchema
};

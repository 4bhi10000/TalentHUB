const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  scheduleInterviewSchema,
  updateInterviewSchema
} = require('../validators/interviewValidators');

router.use(authenticate);

// Schedule new interview (Company)
router.post(
  '/',
  authorizeRoles('COMPANY'),
  validate(scheduleInterviewSchema),
  interviewController.scheduleInterview
);

// Update interview result/feedback (Company)
router.patch(
  '/:id',
  authorizeRoles('COMPANY'),
  validate(updateInterviewSchema),
  interviewController.updateInterview
);

// Get student's scheduled interviews
router.get(
  '/student',
  authorizeRoles('STUDENT'),
  interviewController.getStudentInterviews
);

// Get company's scheduled interviews
router.get(
  '/company',
  authorizeRoles('COMPANY'),
  interviewController.getCompanyInterviews
);

module.exports = router;

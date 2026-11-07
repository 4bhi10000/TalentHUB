const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  applyJobSchema,
  updateApplicationStatusSchema
} = require('../validators/applicationValidators');

router.use(authenticate);

// Student apply endpoint
router.post(
  '/apply',
  authorizeRoles('STUDENT'),
  validate(applyJobSchema),
  applicationController.apply
);

// Company applicant status update
router.patch(
  '/:id/status',
  authorizeRoles('COMPANY'),
  validate(updateApplicationStatusSchema),
  applicationController.updateStatus
);

// Company view applications for specific job
router.get(
  '/job/:jobId',
  authorizeRoles('COMPANY'),
  applicationController.getApplicationsForJob
);

// View specific application detail
router.get(
  '/:id',
  authorizeRoles('STUDENT', 'COMPANY', 'COORDINATOR'),
  applicationController.getApplicationById
);

module.exports = router;

const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createJobSchema, updateJobSchema } = require('../validators/jobValidators');

// Public or authenticated job search
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Protected company job management
router.post(
  '/',
  authenticate,
  authorizeRoles('COMPANY'),
  validate(createJobSchema),
  jobController.createJob
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('COMPANY'),
  validate(updateJobSchema),
  jobController.updateJob
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('COMPANY'),
  jobController.toggleJobStatus
);

module.exports = router;

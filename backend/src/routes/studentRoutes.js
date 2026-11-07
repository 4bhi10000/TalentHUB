const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateStudentProfileSchema } = require('../validators/authValidators');

// Protected for authenticated users
router.use(authenticate);

// Student profile management
router.get('/profile', authorizeRoles('STUDENT'), studentController.getProfile);
router.get('/profile/:id', authorizeRoles('STUDENT', 'COORDINATOR'), studentController.getProfile);
router.put('/profile', authorizeRoles('STUDENT'), validate(updateStudentProfileSchema), studentController.updateProfile);
router.put('/profile/:id', authorizeRoles('STUDENT'), validate(updateStudentProfileSchema), studentController.updateProfile);

// Available jobs with eligibility verification
router.get('/jobs', authorizeRoles('STUDENT'), studentController.getAvailableJobs);

// Student's submitted applications
router.get('/applications', authorizeRoles('STUDENT'), studentController.getMyApplications);

module.exports = router;

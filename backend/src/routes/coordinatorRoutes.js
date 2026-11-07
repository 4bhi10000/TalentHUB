const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinatorController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticate);
router.use(authorizeRoles('COORDINATOR'));

// Aggregate statistics and KPIs
router.get('/stats', coordinatorController.getOverviewStats);

// Department-wise breakdown
router.get('/departments', coordinatorController.getDepartmentStats);

// Company recruitment summary
router.get('/companies-summary', coordinatorController.getCompanySummary);

// Detailed applications report with filters
router.get('/applications-report', coordinatorController.getApplicationsReport);

// Student directory
router.get('/students', coordinatorController.getAllStudents);

// Company directory
router.get('/companies', coordinatorController.getAllCompanies);

module.exports = router;

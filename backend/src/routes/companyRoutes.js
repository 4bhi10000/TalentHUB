const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateCompanyProfileSchema } = require('../validators/authValidators');

router.use(authenticate);

router.get('/profile', authorizeRoles('COMPANY'), companyController.getProfile);
router.get('/profile/:id', authorizeRoles('COMPANY', 'COORDINATOR'), companyController.getProfile);
router.put('/profile', authorizeRoles('COMPANY'), validate(updateCompanyProfileSchema), companyController.updateProfile);
router.get('/jobs', authorizeRoles('COMPANY'), companyController.getMyJobs);
router.get('/applicants', authorizeRoles('COMPANY'), companyController.getMyApplicants);

module.exports = router;

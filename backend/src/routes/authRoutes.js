const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  registerStudentSchema,
  registerCompanySchema,
  loginSchema
} = require('../validators/authValidators');

// Public authentication routes
router.post('/register/student', validate(registerStudentSchema), authController.registerStudent);
router.post('/register/company', validate(registerCompanySchema), authController.registerCompany);
router.post('/login', validate(loginSchema), authController.login);

// Protected token check
router.get('/me', authenticate, authController.getMe);

module.exports = router;

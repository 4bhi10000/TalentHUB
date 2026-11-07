const authService = require('../services/authService');

class AuthController {
  async registerStudent(req, res, next) {
    try {
      const result = await authService.registerStudent(req.body);
      return res.status(201).json({
        success: true,
        message: 'Student registered successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async registerCompany(req, res, next) {
    try {
      const result = await authService.registerCompany(req.body);
      return res.status(201).json({
        success: true,
        message: 'Company registered successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const result = await authService.getCurrentUser(req.user.id);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

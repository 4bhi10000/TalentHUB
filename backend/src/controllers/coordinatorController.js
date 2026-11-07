const coordinatorService = require('../services/coordinatorService');

class CoordinatorController {
  async getOverviewStats(req, res, next) {
    try {
      const stats = await coordinatorService.getOverviewStats(req.user.role);
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentStats(req, res, next) {
    try {
      const stats = await coordinatorService.getDepartmentStats(req.user.role);
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanySummary(req, res, next) {
    try {
      const summary = await coordinatorService.getCompanySummary(req.user.role);
      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationsReport(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        department: req.query.department,
        companyId: req.query.companyId
      };
      const report = await coordinatorService.getApplicationsReport(req.user.role, filters);
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllStudents(req, res, next) {
    try {
      const filters = {
        department: req.query.department,
        graduationYear: req.query.graduationYear ? parseInt(req.query.graduationYear, 10) : undefined
      };
      const students = await coordinatorService.getAllStudents(req.user.role, filters);
      return res.status(200).json({
        success: true,
        data: students
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCompanies(req, res, next) {
    try {
      const companies = await coordinatorService.getAllCompanies(req.user.role);
      return res.status(200).json({
        success: true,
        data: companies
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CoordinatorController();

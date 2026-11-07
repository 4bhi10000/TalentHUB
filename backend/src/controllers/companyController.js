const companyService = require('../services/companyService');

class CompanyController {
  async getProfile(req, res, next) {
    try {
      const companyId = req.params.id || req.user.companyId;
      const profile = await companyService.getProfile(companyId);
      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const companyId = req.params.id || req.user.companyId;
      const updatedProfile = await companyService.updateProfile(companyId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Company profile updated successfully.',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyJobs(req, res, next) {
    try {
      const jobs = await companyService.getMyJobs(req.user.companyId);
      return res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyApplicants(req, res, next) {
    try {
      const statusFilter = req.query.status || null;
      const applicants = await companyService.getMyApplicants(req.user.companyId, statusFilter);
      return res.status(200).json({
        success: true,
        data: applicants
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyController();

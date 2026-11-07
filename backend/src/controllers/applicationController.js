const applicationService = require('../services/applicationService');

class ApplicationController {
  async apply(req, res, next) {
    try {
      const application = await applicationService.applyForJob(req.user.studentId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully.',
        data: application
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, remarks } = req.body;
      const updatedApplication = await applicationService.updateApplicationStatus(
        req.params.id,
        req.user.companyId,
        status,
        remarks
      );
      return res.status(200).json({
        success: true,
        message: `Application status updated to ${status}.`,
        data: updatedApplication
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationsForJob(req, res, next) {
    try {
      const statusFilter = req.query.status || null;
      const applications = await applicationService.getApplicationsForJob(
        req.params.jobId,
        req.user.companyId,
        statusFilter
      );
      return res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationById(req, res, next) {
    try {
      const application = await applicationService.getApplicationById(req.params.id, req.user);
      return res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApplicationController();

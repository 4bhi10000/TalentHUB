const jobService = require('../services/jobService');

class JobController {
  async createJob(req, res, next) {
    try {
      const job = await jobService.createJob(req.user.companyId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Job listing created successfully.',
        data: job
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllJobs(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        companyId: req.query.companyId,
        search: req.query.search
      };
      const jobs = await jobService.getAllJobs(filters);
      return res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req, res, next) {
    try {
      const job = await jobService.getJobById(req.params.id);
      return res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req, res, next) {
    try {
      const updatedJob = await jobService.updateJob(req.params.id, req.user.companyId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Job listing updated successfully.',
        data: updatedJob
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleJobStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updatedJob = await jobService.toggleJobStatus(req.params.id, req.user.companyId, status);
      return res.status(200).json({
        success: true,
        message: `Job listing status changed to ${status}.`,
        data: updatedJob
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JobController();

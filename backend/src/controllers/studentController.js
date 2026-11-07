const studentService = require('../services/studentService');

class StudentController {
  async getProfile(req, res, next) {
    try {
      const studentId = req.params.id || req.user.studentId;
      const profile = await studentService.getProfile(studentId, req.user);
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
      const studentId = req.params.id || req.user.studentId;
      const updatedProfile = await studentService.updateProfile(studentId, req.body, req.user);
      return res.status(200).json({
        success: true,
        message: 'Student profile updated successfully.',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableJobs(req, res, next) {
    try {
      const jobs = await studentService.getAvailableJobsWithEligibility(req.user.studentId);
      return res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyApplications(req, res, next) {
    try {
      const applications = await studentService.getMyApplications(req.user.studentId);
      return res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();

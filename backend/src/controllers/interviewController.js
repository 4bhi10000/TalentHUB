const interviewService = require('../services/interviewService');

class InterviewController {
  async scheduleInterview(req, res, next) {
    try {
      const interview = await interviewService.scheduleInterview(req.user.companyId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Interview round scheduled successfully.',
        data: interview
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInterview(req, res, next) {
    try {
      const updatedInterview = await interviewService.updateInterview(
        req.params.id,
        req.user.companyId,
        req.body
      );
      return res.status(200).json({
        success: true,
        message: 'Interview updated successfully.',
        data: updatedInterview
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentInterviews(req, res, next) {
    try {
      const interviews = await interviewService.getStudentInterviews(req.user.studentId);
      return res.status(200).json({
        success: true,
        data: interviews
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyInterviews(req, res, next) {
    try {
      const interviews = await interviewService.getCompanyInterviews(req.user.companyId);
      return res.status(200).json({
        success: true,
        data: interviews
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InterviewController();

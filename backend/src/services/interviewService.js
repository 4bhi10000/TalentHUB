const interviewRepository = require('../repositories/interviewRepository');
const applicationRepository = require('../repositories/applicationRepository');
const { checkCompanyJobOwnershipRule } = require('../rules/checkCompanyJobOwnershipRule');
const { validateApplicationStatusTransitionRule } = require('../rules/validateApplicationStatusTransitionRule');

class InterviewService {
  async scheduleInterview(companyId, { applicationId, roundName, scheduledDate, mode, venueOrLink }) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found.');
      error.statusCode = 404;
      throw error;
    }

    // Business Rule: Check Company Job Ownership
    checkCompanyJobOwnershipRule(companyId, application.job);

    // If application is in SHORTLISTED, transition it to INTERVIEW
    if (application.status === 'SHORTLISTED') {
      validateApplicationStatusTransitionRule(application.status, 'INTERVIEW');
      await applicationRepository.updateStatus(applicationId, 'INTERVIEW');
    }

    return interviewRepository.create({
      applicationId,
      roundName,
      scheduledDate,
      mode,
      venueOrLink
    });
  }

  async updateInterview(interviewId, companyId, updateData) {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      const error = new Error('Interview not found.');
      error.statusCode = 404;
      throw error;
    }

    // Business Rule: Company ownership check
    checkCompanyJobOwnershipRule(companyId, interview.application.job);

    return interviewRepository.update(interviewId, updateData);
  }

  async getStudentInterviews(studentId) {
    return interviewRepository.findByStudentId(studentId);
  }

  async getCompanyInterviews(companyId) {
    return interviewRepository.findByCompanyId(companyId);
  }
}

module.exports = new InterviewService();

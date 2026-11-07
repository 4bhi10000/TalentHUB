const applicationRepository = require('../repositories/applicationRepository');
const jobRepository = require('../repositories/jobRepository');
const studentRepository = require('../repositories/studentRepository');
const { checkDuplicateApplicationRule } = require('../rules/checkDuplicateApplicationRule');
const { checkJobAcceptingApplicationsRule } = require('../rules/checkJobAcceptingApplicationsRule');
const { checkStudentEligibilityRule } = require('../rules/checkStudentEligibilityRule');
const { checkCompanyJobOwnershipRule } = require('../rules/checkCompanyJobOwnershipRule');
const { validateApplicationStatusTransitionRule } = require('../rules/validateApplicationStatusTransitionRule');
const config = require('../config/appConfig');

class ApplicationService {
  async applyForJob(studentId, { jobId, remarks }) {
    // 1. Fetch Job
    const job = await jobRepository.findById(jobId);
    if (!job) {
      const error = new Error('Job listing not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Business Rule: Check if job is currently open and not expired
    checkJobAcceptingApplicationsRule(job);

    // 3. Business Rule: Check for duplicate application
    const existingApplication = await applicationRepository.findByStudentAndJob(studentId, jobId);
    checkDuplicateApplicationRule(existingApplication, studentId, jobId);

    // 4. Fetch Student Profile and previous applications
    const student = await studentRepository.findById(studentId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const studentApplications = await applicationRepository.findByStudentId(studentId);

    // 5. Business Rule: Check Student Eligibility (CGPA, backlogs, department, placed status)
    checkStudentEligibilityRule(student, job, {
      studentApplications,
      allowMultipleOffers: config.rules.allowMultipleOffers
    });

    // 6. Create Application Record
    return applicationRepository.create({
      studentId,
      jobId,
      remarks
    });
  }

  async updateApplicationStatus(applicationId, companyId, newStatus, remarks = null) {
    // 1. Fetch application
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Business Rule: Only the company that owns the job can manage its applicants
    checkCompanyJobOwnershipRule(companyId, application.job);

    // 3. Business Rule: Validate application status transition
    validateApplicationStatusTransitionRule(application.status, newStatus);

    // 4. Update status
    return applicationRepository.updateStatus(applicationId, newStatus, remarks);
  }

  async getApplicationsForJob(jobId, companyId, statusFilter = null) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      const error = new Error('Job listing not found.');
      error.statusCode = 404;
      throw error;
    }

    // Business Rule: Company ownership check
    checkCompanyJobOwnershipRule(companyId, job);

    return applicationRepository.findByJobId(jobId, statusFilter);
  }

  async getApplicationById(applicationId, authUser) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found.');
      error.statusCode = 404;
      throw error;
    }

    // Authorization check
    if (authUser.role === 'STUDENT' && application.studentId !== authUser.studentId) {
      const error = new Error('Access denied: You can only view your own application.');
      error.statusCode = 403;
      throw error;
    }

    if (authUser.role === 'COMPANY' && application.job.companyId !== authUser.companyId) {
      const error = new Error('Access denied: This application is for another company.');
      error.statusCode = 403;
      throw error;
    }

    return application;
  }
}

module.exports = new ApplicationService();

/**
 * Business Rule: RULE_JOB_ACCEPTING_APPLICATIONS
 * Status: Provisional (Awaiting official college placement manual)
 * Location: src/rules/checkJobAcceptingApplicationsRule.js
 * 
 * Purpose:
 * Enforces that applications can only be submitted to job listings that are currently OPEN
 * and whose application deadline has not expired.
 * 
 * @param {object} job - JobListing entity
 * @param {Date} [currentDate=new Date()] - Reference date for checking expiration
 * @throws {BusinessRuleViolationError} When job is closed or past deadline
 */
const BusinessRuleViolationError = require('./BusinessRuleViolationError');

const RULE_NAME = 'RULE_JOB_ACCEPTING_APPLICATIONS';

function checkJobAcceptingApplicationsRule(job, currentDate = new Date()) {
  if (!job) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      'Application rejected: The specified job listing does not exist.',
      404
    );
  }

  // Check if job status is explicitly OPEN
  if (job.status !== 'OPEN') {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      `Application rejected: Job listing "${job.title}" is currently CLOSED for new applications.`,
      400,
      { jobId: job.id, status: job.status }
    );
  }

  // Check if job deadline has passed
  const deadlineDate = new Date(job.deadline);
  if (deadlineDate.getTime() < currentDate.getTime()) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      `Application rejected: The application deadline for "${job.title}" expired on ${deadlineDate.toISOString().split('T')[0]}.`,
      400,
      { jobId: job.id, deadline: job.deadline, attemptedAt: currentDate }
    );
  }

  return true;
}

module.exports = {
  RULE_NAME,
  checkJobAcceptingApplicationsRule
};

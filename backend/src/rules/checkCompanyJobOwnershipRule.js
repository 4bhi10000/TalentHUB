/**
 * Business Rule: RULE_COMPANY_JOB_OWNERSHIP
 * Status: Provisional (Awaiting official college placement manual)
 * Location: src/rules/checkCompanyJobOwnershipRule.js
 * 
 * Purpose:
 * Enforces that only the company that created a job listing has authorization
 * to view applicants, update applicant statuses, schedule interviews, and issue job offers.
 * 
 * @param {string} authenticatedCompanyId - ID of the currently logged-in company profile
 * @param {object} job - JobListing entity (or object containing companyId)
 * @throws {BusinessRuleViolationError} When company is not the owner
 */
const BusinessRuleViolationError = require('./BusinessRuleViolationError');

const RULE_NAME = 'RULE_COMPANY_JOB_OWNERSHIP';

function checkCompanyJobOwnershipRule(authenticatedCompanyId, job) {
  if (!job) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      'Operation failed: Job listing could not be found.',
      404
    );
  }

  if (!authenticatedCompanyId || job.companyId !== authenticatedCompanyId) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      'Access denied: You do not have permission to manage applicants or job details for a listing owned by another company.',
      403,
      { authenticatedCompanyId, jobCompanyId: job.companyId, jobId: job.id }
    );
  }

  return true;
}

module.exports = {
  RULE_NAME,
  checkCompanyJobOwnershipRule
};

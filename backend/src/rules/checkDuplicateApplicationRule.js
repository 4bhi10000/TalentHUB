/**
 * Business Rule: RULE_NO_DUPLICATE_APPLICATIONS
 * Status: Provisional (Awaiting official college placement manual)
 * Location: src/rules/checkDuplicateApplicationRule.js
 * 
 * Purpose:
 * Enforces that a student cannot submit multiple applications for the exact same job listing.
 * 
 * @param {object|null} existingApplication - Found application record if one already exists
 * @param {string} studentId - Student ID
 * @param {string} jobId - Job Listing ID
 * @throws {BusinessRuleViolationError} When application already exists
 */
const BusinessRuleViolationError = require('./BusinessRuleViolationError');

const RULE_NAME = 'RULE_NO_DUPLICATE_APPLICATIONS';

function checkDuplicateApplicationRule(existingApplication, studentId, jobId) {
  if (existingApplication) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      `Duplicate application rejected: Student has already applied for this job listing (Current status: ${existingApplication.status}).`,
      409,
      { studentId, jobId, existingApplicationId: existingApplication.id, currentStatus: existingApplication.status }
    );
  }
  return true;
}

module.exports = {
  RULE_NAME,
  checkDuplicateApplicationRule
};

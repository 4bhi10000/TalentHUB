/**
 * Business Rule: RULE_STUDENT_PROFILE_OWNERSHIP
 * Status: Provisional (Awaiting official college placement manual)
 * Location: src/rules/checkStudentProfileOwnershipRule.js
 * 
 * Purpose:
 * Enforces privacy and access boundaries: A student can only view and update their own profile.
 * Other roles (e.g., COORDINATOR) may have view privileges governed by role checks,
 * but students may never tamper with or query other students' private academic profiles.
 * 
 * @param {string} authenticatedStudentId - ID of the logged-in student
 * @param {string} targetStudentId - ID of the student record being accessed/updated
 * @param {string} [role='STUDENT'] - Role of the authenticated user
 * @throws {BusinessRuleViolationError} When unauthorized student attempts to access/update profile
 */
const BusinessRuleViolationError = require('./BusinessRuleViolationError');

const RULE_NAME = 'RULE_STUDENT_PROFILE_OWNERSHIP';

function checkStudentProfileOwnershipRule(authenticatedStudentId, targetStudentId, role = 'STUDENT') {
  if (role === 'COORDINATOR') {
    // Coordinators have administrative view access
    return true;
  }

  if (role !== 'STUDENT' || !authenticatedStudentId || authenticatedStudentId !== targetStudentId) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      'Access denied: You are only authorized to access and modify your own student profile.',
      403,
      { authenticatedStudentId, targetStudentId, role }
    );
  }

  return true;
}

module.exports = {
  RULE_NAME,
  checkStudentProfileOwnershipRule
};

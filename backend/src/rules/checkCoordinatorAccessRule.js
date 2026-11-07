/**
 * Business Rule: RULE_COORDINATOR_ACCESS
 * Status: Provisional (Awaiting official college placement manual)
 * Location: src/rules/checkCoordinatorAccessRule.js
 * 
 * Purpose:
 * Enforces that placement statistics, institutional analytics, aggregate reports,
 * and cross-department candidate directories are reserved exclusively for the COORDINATOR role.
 * 
 * @param {string} role - Role of the requesting user
 * @throws {BusinessRuleViolationError} When unauthorized role attempts coordinator action
 */
const BusinessRuleViolationError = require('./BusinessRuleViolationError');

const RULE_NAME = 'RULE_COORDINATOR_ACCESS';

function checkCoordinatorAccessRule(role) {
  if (role !== 'COORDINATOR') {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      'Access denied: Placement reports and institutional statistics are restricted to Placement Coordinators only.',
      403,
      { role, requiredRole: 'COORDINATOR' }
    );
  }
  return true;
}

module.exports = {
  RULE_NAME,
  checkCoordinatorAccessRule
};

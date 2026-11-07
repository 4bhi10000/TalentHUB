/**
 * Business Rule: RULE_APPLICATION_STATUS_TRANSITION
 * Status: Provisional (Awaiting official college placement manual)
 * Location: src/rules/validateApplicationStatusTransitionRule.js
 * 
 * Purpose:
 * Centralized status-transition validator. Guarantees that applications follow an orderly,
 * verified workflow and prevents arbitrary or corrupt status skips.
 * 
 * Allowed standard transitions:
 *   APPLIED      -> [SHORTLISTED, REJECTED]
 *   SHORTLISTED  -> [INTERVIEW, REJECTED]
 *   INTERVIEW    -> [OFFERED, REJECTED]
 *   OFFERED      -> [HIRED, REJECTED]
 *   HIRED        -> [] (Terminal)
 *   REJECTED     -> [] (Terminal)
 * 
 * @param {string} currentStatus - Current status of the application
 * @param {string} newStatus - Target status to transition to
 * @throws {BusinessRuleViolationError} When requested transition violates state machine rules
 */
const BusinessRuleViolationError = require('./BusinessRuleViolationError');
const config = require('../config/appConfig');

const RULE_NAME = 'RULE_APPLICATION_STATUS_TRANSITION';

const VALID_STATUSES = [
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'HIRED',
  'REJECTED'
];

function validateApplicationStatusTransitionRule(currentStatus, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      `Invalid application status: "${newStatus}". Must be one of: ${VALID_STATUSES.join(', ')}.`,
      400,
      { currentStatus, newStatus, validStatuses: VALID_STATUSES }
    );
  }

  // Idempotent transition (same status) is a no-op / allowed
  if (currentStatus === newStatus) {
    return true;
  }

  const allowedTransitions = config.rules.allowedStatusTransitions[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      `Illegal application status transition: Cannot transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'None (Terminal state)'}.`,
      400,
      { currentStatus, newStatus, allowedTransitions }
    );
  }

  return true;
}

module.exports = {
  RULE_NAME,
  VALID_STATUSES,
  validateApplicationStatusTransitionRule
};

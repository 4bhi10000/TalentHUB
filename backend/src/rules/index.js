/**
 * Business Rules Module Index
 * Central export of all business rules and rule violation error class.
 */
const BusinessRuleViolationError = require('./BusinessRuleViolationError');
const { RULE_NAME: RULE_NO_DUPLICATE_APPLICATIONS, checkDuplicateApplicationRule } = require('./checkDuplicateApplicationRule');
const { RULE_NAME: RULE_JOB_ACCEPTING_APPLICATIONS, checkJobAcceptingApplicationsRule } = require('./checkJobAcceptingApplicationsRule');
const { RULE_NAME: RULE_STUDENT_ELIGIBILITY, evaluateStudentEligibility, checkStudentEligibilityRule } = require('./checkStudentEligibilityRule');
const { RULE_NAME: RULE_COMPANY_JOB_OWNERSHIP, checkCompanyJobOwnershipRule } = require('./checkCompanyJobOwnershipRule');
const { RULE_NAME: RULE_STUDENT_PROFILE_OWNERSHIP, checkStudentProfileOwnershipRule } = require('./checkStudentProfileOwnershipRule');
const { RULE_NAME: RULE_APPLICATION_STATUS_TRANSITION, VALID_STATUSES, validateApplicationStatusTransitionRule } = require('./validateApplicationStatusTransitionRule');
const { RULE_NAME: RULE_OFFER_ACCEPTANCE, checkOfferAcceptanceRule } = require('./checkOfferAcceptanceRule');
const { RULE_NAME: RULE_COORDINATOR_ACCESS, checkCoordinatorAccessRule } = require('./checkCoordinatorAccessRule');

module.exports = {
  BusinessRuleViolationError,
  // Rules
  RULE_NO_DUPLICATE_APPLICATIONS,
  checkDuplicateApplicationRule,

  RULE_JOB_ACCEPTING_APPLICATIONS,
  checkJobAcceptingApplicationsRule,

  RULE_STUDENT_ELIGIBILITY,
  evaluateStudentEligibility,
  checkStudentEligibilityRule,

  RULE_COMPANY_JOB_OWNERSHIP,
  checkCompanyJobOwnershipRule,

  RULE_STUDENT_PROFILE_OWNERSHIP,
  checkStudentProfileOwnershipRule,

  RULE_APPLICATION_STATUS_TRANSITION,
  VALID_STATUSES,
  validateApplicationStatusTransitionRule,

  RULE_OFFER_ACCEPTANCE,
  checkOfferAcceptanceRule,

  RULE_COORDINATOR_ACCESS,
  checkCoordinatorAccessRule
};

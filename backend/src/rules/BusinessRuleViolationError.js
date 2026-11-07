/**
 * BusinessRuleViolationError
 * Standard error thrown when a business rule precondition or validation check fails.
 */
class BusinessRuleViolationError extends Error {
  constructor(ruleName, message, statusCode = 400, details = null) {
    super(message);
    this.name = 'BusinessRuleViolationError';
    this.ruleName = ruleName;
    this.statusCode = statusCode;
    this.details = details;
    this.isBusinessRule = true;
  }
}

module.exports = BusinessRuleViolationError;

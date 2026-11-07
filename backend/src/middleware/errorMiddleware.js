/**
 * Centralized Application Error Handling Middleware
 */
const BusinessRuleViolationError = require('../rules/BusinessRuleViolationError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // 1. Business Rule Violations
  if (err instanceof BusinessRuleViolationError || err.isBusinessRule) {
    return res.status(err.statusCode || 400).json({
      success: false,
      errorType: 'BUSINESS_RULE_VIOLATION',
      ruleName: err.ruleName,
      message: err.message,
      details: err.details || null
    });
  }

  // 2. Prisma Known Errors
  if (err.code === 'P2002') {
    const targetFields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      errorType: 'DATABASE_CONFLICT',
      message: `A record with this ${targetFields} already exists in the system.`,
      details: err.meta
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      errorType: 'NOT_FOUND',
      message: 'The requested resource was not found.',
      details: err.meta
    });
  }

  // 3. Fallback Client/Server Error
  const statusCode = err.status || err.statusCode || 500;
  if (statusCode >= 500) {
    console.error('[SERVER ERROR]:', err);
  }

  return res.status(statusCode).json({
    success: false,
    errorType: statusCode >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR',
    message: err.message || 'An unexpected error occurred.'
  });
}

module.exports = errorHandler;

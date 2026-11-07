/**
 * Role-Based Authorization Middleware
 * Enforces that req.user.role belongs to the allowed roles array.
 * 
 * @param {string[]} allowedRoles - Array of allowed roles: 'STUDENT', 'COMPANY', 'COORDINATOR'
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Required role: [${allowedRoles.join(', ')}], your role: [${req.user.role}].`
      });
    }

    next();
  };
}

module.exports = authorizeRoles;

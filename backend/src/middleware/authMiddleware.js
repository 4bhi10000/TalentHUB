const jwt = require('jsonwebtoken');
const config = require('../config/appConfig');
const { prisma } = require('../config/database');

/**
 * Authentication Middleware
 * Validates Authorization: Bearer <token> header and attaches user context.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        student: { select: { id: true, fullName: true, rollNumber: true, department: true } },
        company: { select: { id: true, companyName: true } }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account associated with this token no longer exists.'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      studentId: user.student ? user.student.id : null,
      companyId: user.company ? user.company.id : null,
      student: user.student,
      company: user.company
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticate;

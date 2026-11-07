/**
 * Centralized Application Configuration
 * Holds environment variables, configurable thresholds, and provisional business rule limits.
 */
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'talenthub_super_secret_jwt_key_2026_dev_mode',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  // Configurable Provisional Business Rules Configuration
  rules: {
    // If true, student can accept multiple offers; if false, accepting one offer marks student HIRED and prevents new applications/offers
    allowMultipleOffers: process.env.ALLOW_MULTIPLE_OFFERS === 'true' || false,

    // Default validity duration (in days) for issued job offers
    defaultOfferValidityDays: parseInt(process.env.DEFAULT_OFFER_DEADLINE_DAYS || '7', 10),

    // Application status flow definitions
    allowedStatusTransitions: {
      APPLIED: ['SHORTLISTED', 'REJECTED'],
      SHORTLISTED: ['INTERVIEW', 'REJECTED'],
      INTERVIEW: ['OFFERED', 'REJECTED'],
      OFFERED: ['HIRED', 'REJECTED'],
      HIRED: [], // Terminal state
      REJECTED: [] // Terminal state
    },

    // Default maximum active backlogs permitted unless overridden by job posting
    defaultMaxAllowedBacklogs: 0,

    // Default minimum CGPA required unless overridden by job posting
    defaultMinCgpa: 0.0
  }
};

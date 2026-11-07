/**
 * Business Rule: RULE_OFFER_ACCEPTANCE
 * Status: Provisional (Awaiting official college placement manual)
 * Location: src/rules/checkOfferAcceptanceRule.js
 * 
 * Purpose:
 * Validates offer responses (acceptance/rejection by student):
 *  1. Decision can only be taken by the candidate associated with the application.
 *  2. Offer must be in PENDING status (cannot re-accept or change accepted/rejected offer).
 *  3. Offer must not have expired.
 *  4. Enforces the one-offer policy if allowMultipleOffers is false.
 * 
 * @param {object} offer - Offer entity with associated application & student
 * @param {string} authenticatedStudentId - ID of logged-in student
 * @param {string} decision - 'ACCEPTED' or 'REJECTED'
 * @param {object} [options] - Additional parameters (e.g., studentExistingHiredOffer)
 * @throws {BusinessRuleViolationError} When offer decision violates constraints
 */
const BusinessRuleViolationError = require('./BusinessRuleViolationError');
const config = require('../config/appConfig');

const RULE_NAME = 'RULE_OFFER_ACCEPTANCE';

function checkOfferAcceptanceRule(offer, authenticatedStudentId, decision, options = {}) {
  if (!offer) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      'Offer not found.',
      404
    );
  }

  // 1. Ownership check: Must be the student to whom the offer was extended
  const offerStudentId = offer.application?.studentId || offer.studentId;
  if (offerStudentId && offerStudentId !== authenticatedStudentId) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      'Access denied: You are not authorized to respond to an offer issued to another student.',
      403,
      { authenticatedStudentId, offerStudentId }
    );
  }

  // 2. Decision validity
  if (!['ACCEPTED', 'REJECTED'].includes(decision)) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      `Invalid offer decision: "${decision}". Must be either ACCEPTED or REJECTED.`,
      400,
      { decision }
    );
  }

  // 3. Status check: Offer must be in PENDING state
  if (offer.status !== 'PENDING') {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      `Offer decision rejected: This offer has already been resolved with status "${offer.status}".`,
      400,
      { offerId: offer.id, currentStatus: offer.status }
    );
  }

  // 4. Expiration check
  if (offer.deadline) {
    const deadlineDate = new Date(offer.deadline);
    const now = options.currentDate || new Date();
    if (deadlineDate.getTime() < now.getTime()) {
      throw new BusinessRuleViolationError(
        RULE_NAME,
        `Offer decision rejected: This offer expired on ${deadlineDate.toISOString().split('T')[0]}.`,
        400,
        { offerId: offer.id, deadline: offer.deadline, attemptedAt: now }
      );
    }
  }

  // 5. One offer policy check
  const allowMultipleOffers = options.allowMultipleOffers !== undefined
    ? options.allowMultipleOffers
    : config.rules.allowMultipleOffers;

  if (decision === 'ACCEPTED' && !allowMultipleOffers && options.hasExistingAcceptedOffer) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      'Offer acceptance rejected: Institutional policy permits only one accepted placement offer per student. You have already accepted another offer.',
      400,
      { studentId: authenticatedStudentId }
    );
  }

  return true;
}

module.exports = {
  RULE_NAME,
  checkOfferAcceptanceRule
};

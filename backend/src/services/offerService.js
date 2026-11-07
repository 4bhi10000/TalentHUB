const offerRepository = require('../repositories/offerRepository');
const applicationRepository = require('../repositories/applicationRepository');
const { checkCompanyJobOwnershipRule } = require('../rules/checkCompanyJobOwnershipRule');
const { validateApplicationStatusTransitionRule } = require('../rules/validateApplicationStatusTransitionRule');
const { checkOfferAcceptanceRule } = require('../rules/checkOfferAcceptanceRule');
const config = require('../config/appConfig');

class OfferService {
  async issueOffer(companyId, { applicationId, ctc, designation, joiningDate, offerLetterUrl, deadline, remarks }) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found.');
      error.statusCode = 404;
      throw error;
    }

    // Business Rule Check: Company Job Ownership
    checkCompanyJobOwnershipRule(companyId, application.job);

    // Business Rule Check: Status transition to OFFERED
    validateApplicationStatusTransitionRule(application.status, 'OFFERED');

    // Check if offer already issued for this application
    const existingOffer = await offerRepository.findByApplicationId(applicationId);
    if (existingOffer) {
      const error = new Error('An offer has already been issued for this application.');
      error.statusCode = 409;
      throw error;
    }

    // Default deadline if omitted
    let effectiveDeadline = deadline;
    if (!effectiveDeadline) {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + config.rules.defaultOfferValidityDays);
      effectiveDeadline = deadlineDate.toISOString();
    }

    return offerRepository.create({
      applicationId,
      ctc,
      designation,
      joiningDate,
      offerLetterUrl,
      deadline: effectiveDeadline,
      remarks
    });
  }

  async respondToOffer(offerId, studentId, decision, remarks = null) {
    const offer = await offerRepository.findById(offerId);
    if (!offer) {
      const error = new Error('Offer not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if student already has another accepted offer (college one-offer policy check)
    const allStudentOffers = await offerRepository.findByStudentId(studentId);
    const hasExistingAcceptedOffer = allStudentOffers.some(
      o => o.status === 'ACCEPTED' && o.id !== offerId
    );

    // Business Rule Check: Offer Acceptance Rules
    checkOfferAcceptanceRule(offer, studentId, decision, {
      hasExistingAcceptedOffer,
      allowMultipleOffers: config.rules.allowMultipleOffers
    });

    return offerRepository.recordStudentDecision(offerId, offer.applicationId, decision, remarks);
  }

  async getStudentOffers(studentId) {
    return offerRepository.findByStudentId(studentId);
  }

  async getCompanyOffers(companyId) {
    return offerRepository.findByCompanyId(companyId);
  }
}

module.exports = new OfferService();

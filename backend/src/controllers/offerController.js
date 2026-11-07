const offerService = require('../services/offerService');

class OfferController {
  async issueOffer(req, res, next) {
    try {
      const offer = await offerService.issueOffer(req.user.companyId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Job offer issued successfully.',
        data: offer
      });
    } catch (error) {
      next(error);
    }
  }

  async respondToOffer(req, res, next) {
    try {
      const { decision, remarks } = req.body;
      const updatedOffer = await offerService.respondToOffer(
        req.params.id,
        req.user.studentId,
        decision,
        remarks
      );
      return res.status(200).json({
        success: true,
        message: `Offer decision "${decision}" recorded successfully.`,
        data: updatedOffer
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentOffers(req, res, next) {
    try {
      const offers = await offerService.getStudentOffers(req.user.studentId);
      return res.status(200).json({
        success: true,
        data: offers
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyOffers(req, res, next) {
    try {
      const offers = await offerService.getCompanyOffers(req.user.companyId);
      return res.status(200).json({
        success: true,
        data: offers
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OfferController();

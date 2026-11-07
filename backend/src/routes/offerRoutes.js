const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  issueOfferSchema,
  respondOfferSchema
} = require('../validators/offerValidators');

router.use(authenticate);

// Company issues job offer to candidate
router.post(
  '/',
  authorizeRoles('COMPANY'),
  validate(issueOfferSchema),
  offerController.issueOffer
);

// Student accepts or rejects job offer
router.patch(
  '/:id/respond',
  authorizeRoles('STUDENT'),
  validate(respondOfferSchema),
  offerController.respondToOffer
);

// Student lists offers extended to them
router.get(
  '/student',
  authorizeRoles('STUDENT'),
  offerController.getStudentOffers
);

// Company lists offers issued by them
router.get(
  '/company',
  authorizeRoles('COMPANY'),
  offerController.getCompanyOffers
);

module.exports = router;

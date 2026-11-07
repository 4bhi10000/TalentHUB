const { prisma } = require('../config/database');

class OfferRepository {
  async create({ applicationId, ctc, designation, joiningDate, offerLetterUrl, deadline, remarks }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create or upsert offer record
      const offer = await tx.offer.create({
        data: {
          applicationId,
          ctc,
          designation,
          joiningDate: joiningDate ? new Date(joiningDate) : null,
          offerLetterUrl,
          deadline: deadline ? new Date(deadline) : null,
          remarks,
          status: 'PENDING'
        }
      });

      // 2. Transition application status to OFFERED
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: 'OFFERED',
          statusUpdatedAt: new Date()
        }
      });

      return offer;
    });
  }

  async findById(id) {
    return prisma.offer.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            student: {
              include: {
                user: { select: { email: true } }
              }
            },
            job: {
              include: {
                company: true
              }
            }
          }
        }
      }
    });
  }

  async findByApplicationId(applicationId) {
    return prisma.offer.findUnique({
      where: { applicationId },
      include: {
        application: {
          include: {
            student: true,
            job: { include: { company: true } }
          }
        }
      }
    });
  }

  async findByStudentId(studentId) {
    return prisma.offer.findMany({
      where: {
        application: {
          studentId
        }
      },
      include: {
        application: {
          include: {
            job: {
              include: {
                company: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByCompanyId(companyId) {
    return prisma.offer.findMany({
      where: {
        application: {
          job: {
            companyId
          }
        }
      },
      include: {
        application: {
          include: {
            student: true,
            job: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async recordStudentDecision(offerId, applicationId, decision, remarks = null) {
    return prisma.$transaction(async (tx) => {
      const updatedOffer = await tx.offer.update({
        where: { id: offerId },
        data: {
          status: decision,
          responseDate: new Date(),
          remarks: remarks || undefined
        }
      });

      // Update application status accordingly
      const newAppStatus = decision === 'ACCEPTED' ? 'HIRED' : 'REJECTED';
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: newAppStatus,
          statusUpdatedAt: new Date(),
          remarks: remarks ? `Offer ${decision}: ${remarks}` : `Offer ${decision}`
        }
      });

      return updatedOffer;
    });
  }
}

module.exports = new OfferRepository();

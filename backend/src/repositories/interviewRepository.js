const { prisma } = require('../config/database');

class InterviewRepository {
  async create({ applicationId, roundName, scheduledDate, mode, venueOrLink }) {
    return prisma.interview.create({
      data: {
        applicationId,
        roundName,
        scheduledDate: new Date(scheduledDate),
        mode: mode || 'ONLINE',
        venueOrLink,
        status: 'SCHEDULED'
      },
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

  async findById(id) {
    return prisma.interview.findUnique({
      where: { id },
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

  async findByApplicationId(applicationId) {
    return prisma.interview.findMany({
      where: { applicationId },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  async findByCompanyId(companyId) {
    return prisma.interview.findMany({
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
      orderBy: { scheduledDate: 'asc' }
    });
  }

  async findByStudentId(studentId) {
    return prisma.interview.findMany({
      where: {
        application: {
          studentId
        }
      },
      include: {
        application: {
          include: {
            job: {
              include: { company: true }
            }
          }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  async update(id, updateData) {
    return prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        application: {
          include: {
            student: true,
            job: true
          }
        }
      }
    });
  }
}

module.exports = new InterviewRepository();

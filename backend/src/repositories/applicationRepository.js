const { prisma } = require('../config/database');

class ApplicationRepository {
  async findById(id) {
    return prisma.application.findUnique({
      where: { id },
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
        },
        interviews: {
          orderBy: { scheduledDate: 'asc' }
        },
        offer: true
      }
    });
  }

  async findByStudentAndJob(studentId, jobId) {
    return prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId,
          jobId
        }
      }
    });
  }

  async findByStudentId(studentId) {
    return prisma.application.findMany({
      where: { studentId },
      include: {
        job: {
          include: {
            company: {
              select: { id: true, companyName: true, industry: true, location: true }
            }
          }
        },
        interviews: {
          orderBy: { scheduledDate: 'desc' }
        },
        offer: true
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async findByJobId(jobId, statusFilter = null) {
    const where = { jobId };
    if (statusFilter) {
      where.status = statusFilter;
    }

    return prisma.application.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { email: true } }
          }
        },
        interviews: {
          orderBy: { scheduledDate: 'asc' }
        },
        offer: true
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async findByCompanyId(companyId, statusFilter = null) {
    const where = {
      job: {
        companyId
      }
    };
    if (statusFilter) {
      where.status = statusFilter;
    }

    return prisma.application.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { email: true } }
          }
        },
        job: {
          select: { id: true, title: true, packageCtc: true, companyId: true }
        },
        interviews: true,
        offer: true
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async create({ studentId, jobId, remarks }) {
    return prisma.application.create({
      data: {
        studentId,
        jobId,
        remarks,
        status: 'APPLIED',
        appliedAt: new Date(),
        statusUpdatedAt: new Date()
      },
      include: {
        job: {
          include: { company: true }
        },
        student: true
      }
    });
  }

  async updateStatus(id, newStatus, remarks = null) {
    const data = {
      status: newStatus,
      statusUpdatedAt: new Date()
    };
    if (remarks !== null && remarks !== undefined) {
      data.remarks = remarks;
    }

    return prisma.application.update({
      where: { id },
      data,
      include: {
        student: true,
        job: { include: { company: true } },
        offer: true,
        interviews: true
      }
    });
  }
}

module.exports = new ApplicationRepository();

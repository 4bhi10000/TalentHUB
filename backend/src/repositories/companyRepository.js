const { prisma } = require('../config/database');

class CompanyRepository {
  async findById(id) {
    return prisma.company.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
        jobListings: {
          include: {
            _count: {
              select: { applications: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async findByUserId(userId) {
    return prisma.company.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, role: true } }
      }
    });
  }

  async update(id, updateData) {
    return prisma.company.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, email: true } }
      }
    });
  }

  async findAll() {
    return prisma.company.findMany({
      include: {
        user: { select: { email: true } },
        _count: {
          select: { jobListings: true }
        }
      },
      orderBy: { companyName: 'asc' }
    });
  }
}

module.exports = new CompanyRepository();

const { prisma } = require('../config/database');

class JobRepository {
  async create(jobData) {
    return prisma.jobListing.create({
      data: jobData,
      include: {
        company: {
          select: { companyName: true, industry: true, location: true, website: true }
        }
      }
    });
  }

  async findById(id) {
    return prisma.jobListing.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, companyName: true, industry: true, location: true, website: true }
        },
        _count: {
          select: { applications: true }
        }
      }
    });
  }

  async findAll(filters = {}) {
    const where = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { company: { companyName: { contains: filters.search } } }
      ];
    }

    return prisma.jobListing.findMany({
      where,
      include: {
        company: {
          select: { id: true, companyName: true, industry: true, location: true }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id, updateData) {
    return prisma.jobListing.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: { id: true, companyName: true }
        }
      }
    });
  }

  async delete(id) {
    return prisma.jobListing.delete({
      where: { id }
    });
  }
}

module.exports = new JobRepository();

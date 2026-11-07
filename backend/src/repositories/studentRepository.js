const { prisma } = require('../config/database');

class StudentRepository {
  async findById(id) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
        applications: {
          include: {
            job: {
              include: {
                company: { select: { companyName: true, industry: true, location: true } }
              }
            },
            offer: true,
            interviews: true
          }
        }
      }
    });
  }

  async findByUserId(userId) {
    return prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, role: true } }
      }
    });
  }

  async findByRollNumber(rollNumber) {
    return prisma.student.findUnique({
      where: { rollNumber }
    });
  }

  async update(id, updateData) {
    return prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, email: true } }
      }
    });
  }

  async findAll(filters = {}) {
    const where = {};
    if (filters.department) {
      where.department = filters.department;
    }
    if (filters.graduationYear) {
      where.graduationYear = filters.graduationYear;
    }

    return prisma.student.findMany({
      where,
      include: {
        user: { select: { email: true } },
        applications: {
          select: {
            id: true,
            status: true,
            job: { select: { title: true, company: { select: { companyName: true } } } },
            offer: { select: { ctc: true, status: true, designation: true } }
          }
        }
      },
      orderBy: { rollNumber: 'asc' }
    });
  }
}

module.exports = new StudentRepository();

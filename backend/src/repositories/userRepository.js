const { prisma } = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        company: true
      }
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        company: true
      }
    });
  }

  async createStudentUser({ email, hashedPassword, fullName, rollNumber, department, cgpa, graduationYear, activeBacklogs, phone, resumeUrl, skills }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'STUDENT'
        }
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          fullName,
          rollNumber,
          department,
          cgpa,
          graduationYear,
          activeBacklogs: activeBacklogs || 0,
          phone,
          resumeUrl,
          skills
        }
      });

      return { ...user, student };
    });
  }

  async createCompanyUser({ email, hashedPassword, companyName, industry, website, description, contactEmail, contactPhone, location }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'COMPANY'
        }
      });

      const company = await tx.company.create({
        data: {
          userId: user.id,
          companyName,
          industry,
          website,
          description,
          contactEmail: contactEmail || email,
          contactPhone,
          location
        }
      });

      return { ...user, company };
    });
  }

  async createCoordinatorUser({ email, hashedPassword }) {
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'COORDINATOR'
      }
    });
  }
}

module.exports = new UserRepository();

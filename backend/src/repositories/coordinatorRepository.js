const { prisma } = require('../config/database');

class CoordinatorRepository {
  async getOverviewStats() {
    const totalStudents = await prisma.student.count();
    const totalCompanies = await prisma.company.count();
    const totalJobListings = await prisma.jobListing.count();
    const openJobListings = await prisma.jobListing.count({ where: { status: 'OPEN' } });
    const totalApplications = await prisma.application.count();

    // Placed students: unique students who have at least one application with status 'HIRED' or offer status 'ACCEPTED'
    const placedStudentsRecords = await prisma.application.findMany({
      where: {
        OR: [
          { status: 'HIRED' },
          { offer: { status: 'ACCEPTED' } }
        ]
      },
      select: {
        studentId: true,
        offer: { select: { ctc: true } }
      }
    });

    const uniquePlacedStudentIds = new Set(placedStudentsRecords.map(r => r.studentId));
    const totalPlacedStudents = uniquePlacedStudentIds.size;
    const placementPercentage = totalStudents > 0 
      ? Number(((totalPlacedStudents / totalStudents) * 100).toFixed(2)) 
      : 0;

    // CTC Metrics
    const acceptedCtcs = placedStudentsRecords
      .map(r => r.offer?.ctc)
      .filter(ctc => typeof ctc === 'number');

    const highestCtc = acceptedCtcs.length > 0 ? Math.max(...acceptedCtcs) : 0;
    const averageCtc = acceptedCtcs.length > 0
      ? Number((acceptedCtcs.reduce((a, b) => a + b, 0) / acceptedCtcs.length).toFixed(2))
      : 0;

    return {
      totalStudents,
      totalCompanies,
      totalJobListings,
      openJobListings,
      totalApplications,
      totalPlacedStudents,
      placementPercentage,
      highestCtc,
      averageCtc
    };
  }

  async getDepartmentStats() {
    const students = await prisma.student.findMany({
      include: {
        applications: {
          where: {
            OR: [
              { status: 'HIRED' },
              { offer: { status: 'ACCEPTED' } }
            ]
          }
        }
      }
    });

    const deptMap = {};
    for (const student of students) {
      const dept = student.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, totalStudents: 0, placedStudents: 0 };
      }
      deptMap[dept].totalStudents += 1;
      if (student.applications.length > 0) {
        deptMap[dept].placedStudents += 1;
      }
    }

    return Object.values(deptMap).map(d => ({
      ...d,
      placementPercentage: d.totalStudents > 0
        ? Number(((d.placedStudents / d.totalStudents) * 100).toFixed(2))
        : 0
    }));
  }

  async getCompanySummary() {
    const companies = await prisma.company.findMany({
      include: {
        jobListings: {
          include: {
            applications: {
              include: { offer: true }
            }
          }
        }
      }
    });

    return companies.map(company => {
      let totalApplications = 0;
      let hiredCount = 0;

      company.jobListings.forEach(job => {
        totalApplications += job.applications.length;
        hiredCount += job.applications.filter(
          app => app.status === 'HIRED' || app.offer?.status === 'ACCEPTED'
        ).length;
      });

      return {
        companyId: company.id,
        companyName: company.companyName,
        industry: company.industry,
        totalJobs: company.jobListings.length,
        totalApplications,
        hiredCount
      };
    });
  }

  async getApplicationsReport(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.department) {
      where.student = { department: filters.department };
    }
    if (filters.companyId) {
      where.job = { companyId: filters.companyId };
    }

    return prisma.application.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            rollNumber: true,
            department: true,
            cgpa: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            packageCtc: true,
            company: {
              select: {
                id: true,
                companyName: true
              }
            }
          }
        },
        offer: true
      },
      orderBy: { appliedAt: 'desc' }
    });
  }
}

module.exports = new CoordinatorRepository();

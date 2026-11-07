const studentRepository = require('../repositories/studentRepository');
const jobRepository = require('../repositories/jobRepository');
const applicationRepository = require('../repositories/applicationRepository');
const { checkStudentProfileOwnershipRule } = require('../rules/checkStudentProfileOwnershipRule');
const { evaluateStudentEligibility } = require('../rules/checkStudentEligibilityRule');
const config = require('../config/appConfig');

class StudentService {
  async getProfile(targetStudentId, authUser) {
    // Business Rule Check: Students can only view their own profile (coordinators can view all)
    checkStudentProfileOwnershipRule(authUser.studentId, targetStudentId, authUser.role);

    const student = await studentRepository.findById(targetStudentId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    return student;
  }

  async updateProfile(targetStudentId, updateData, authUser) {
    // Business Rule Check: Students can only update their own profile
    checkStudentProfileOwnershipRule(authUser.studentId, targetStudentId, authUser.role);

    const existingStudent = await studentRepository.findById(targetStudentId);
    if (!existingStudent) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // Sanitize non-editable fields if any
    delete updateData.id;
    delete updateData.userId;
    delete updateData.rollNumber; // Roll number is typically non-editable after registration

    return studentRepository.update(targetStudentId, updateData);
  }

  async getAvailableJobsWithEligibility(studentId) {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // Get all open jobs
    const jobs = await jobRepository.findAll({ status: 'OPEN' });

    // Get existing student applications to mark already applied
    const studentApplications = await applicationRepository.findByStudentId(studentId);
    const appliedJobMap = new Map();
    studentApplications.forEach(app => {
      appliedJobMap.set(app.jobId, app);
    });

    // Evaluate eligibility for each job using business rule
    return jobs.map(job => {
      const eligibility = evaluateStudentEligibility(student, job, {
        allowMultipleOffers: config.rules.allowMultipleOffers,
        studentApplications
      });

      const application = appliedJobMap.get(job.id) || null;

      return {
        ...job,
        eligibility: {
          isEligible: eligibility.isEligible,
          reasons: eligibility.reasons
        },
        hasApplied: Boolean(application),
        applicationId: application ? application.id : null,
        applicationStatus: application ? application.status : null
      };
    });
  }

  async getMyApplications(studentId) {
    return applicationRepository.findByStudentId(studentId);
  }
}

module.exports = new StudentService();

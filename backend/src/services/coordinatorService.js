const coordinatorRepository = require('../repositories/coordinatorRepository');
const studentRepository = require('../repositories/studentRepository');
const companyRepository = require('../repositories/companyRepository');
const { checkCoordinatorAccessRule } = require('../rules/checkCoordinatorAccessRule');

class CoordinatorService {
  async getOverviewStats(role) {
    checkCoordinatorAccessRule(role);
    return coordinatorRepository.getOverviewStats();
  }

  async getDepartmentStats(role) {
    checkCoordinatorAccessRule(role);
    return coordinatorRepository.getDepartmentStats();
  }

  async getCompanySummary(role) {
    checkCoordinatorAccessRule(role);
    return coordinatorRepository.getCompanySummary();
  }

  async getApplicationsReport(role, filters = {}) {
    checkCoordinatorAccessRule(role);
    return coordinatorRepository.getApplicationsReport(filters);
  }

  async getAllStudents(role, filters = {}) {
    checkCoordinatorAccessRule(role);
    return studentRepository.findAll(filters);
  }

  async getAllCompanies(role) {
    checkCoordinatorAccessRule(role);
    return companyRepository.findAll();
  }
}

module.exports = new CoordinatorService();

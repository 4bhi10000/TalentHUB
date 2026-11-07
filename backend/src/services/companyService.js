const companyRepository = require('../repositories/companyRepository');
const jobRepository = require('../repositories/jobRepository');
const applicationRepository = require('../repositories/applicationRepository');

class CompanyService {
  async getProfile(companyId) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      const error = new Error('Company profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return company;
  }

  async updateProfile(companyId, updateData) {
    const existingCompany = await companyRepository.findById(companyId);
    if (!existingCompany) {
      const error = new Error('Company profile not found.');
      error.statusCode = 404;
      throw error;
    }

    delete updateData.id;
    delete updateData.userId;

    return companyRepository.update(companyId, updateData);
  }

  async getMyJobs(companyId) {
    return jobRepository.findAll({ companyId });
  }

  async getMyApplicants(companyId, statusFilter = null) {
    return applicationRepository.findByCompanyId(companyId, statusFilter);
  }
}

module.exports = new CompanyService();

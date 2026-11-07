const jobRepository = require('../repositories/jobRepository');
const { checkCompanyJobOwnershipRule } = require('../rules/checkCompanyJobOwnershipRule');

class JobService {
  async createJob(companyId, jobData) {
    return jobRepository.create({
      ...jobData,
      companyId,
      deadline: new Date(jobData.deadline)
    });
  }

  async getJobById(jobId) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      const error = new Error('Job listing not found.');
      error.statusCode = 404;
      throw error;
    }
    return job;
  }

  async getAllJobs(filters = {}) {
    return jobRepository.findAll(filters);
  }

  async updateJob(jobId, companyId, updateData) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      const error = new Error('Job listing not found.');
      error.statusCode = 404;
      throw error;
    }

    // Business Rule Check: Only company that owns the job can update it
    checkCompanyJobOwnershipRule(companyId, job);

    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }

    return jobRepository.update(jobId, updateData);
  }

  async toggleJobStatus(jobId, companyId, status) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      const error = new Error('Job listing not found.');
      error.statusCode = 404;
      throw error;
    }

    // Business Rule Check: Only owner can modify status
    checkCompanyJobOwnershipRule(companyId, job);

    return jobRepository.update(jobId, { status });
  }
}

module.exports = new JobService();

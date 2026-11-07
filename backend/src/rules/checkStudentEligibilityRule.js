/**
 * Business Rule: RULE_STUDENT_ELIGIBILITY
 * Status: Provisional (Awaiting official college placement manual)
 * Location: src/rules/checkStudentEligibilityRule.js
 * 
 * Purpose:
 * Verifies whether a student meets the academic and policy criteria defined for a specific job:
 *  1. CGPA >= Minimum CGPA required
 *  2. Active Backlogs <= Maximum permitted backlogs
 *  3. Student Department is listed within allowed departments (if specified)
 *  4. Student is not already HIRED (unless allowMultipleOffers policy allows it)
 * 
 * @param {object} student - Student entity with academic profile
 * @param {object} job - JobListing entity with eligibility constraints
 * @param {object} [options] - Optional context options (e.g., studentApplications, allowMultipleOffers)
 * @throws {BusinessRuleViolationError} When one or more eligibility checks fail
 */
const BusinessRuleViolationError = require('./BusinessRuleViolationError');
const config = require('../config/appConfig');

const RULE_NAME = 'RULE_STUDENT_ELIGIBILITY';

/**
 * Pure evaluation function that calculates eligibility without throwing.
 * Useful for filtering and displaying visual eligibility badges in the UI.
 * 
 * @param {object} student 
 * @param {object} job 
 * @param {object} [options]
 * @returns {{ isEligible: boolean, reasons: string[] }}
 */
function evaluateStudentEligibility(student, job, options = {}) {
  const reasons = [];

  if (!student) {
    return { isEligible: false, reasons: ['Student profile is missing or incomplete.'] };
  }
  if (!job) {
    return { isEligible: false, reasons: ['Job listing details are not available.'] };
  }

  // 1. CGPA Check
  const minCgpa = job.minCgpa !== undefined && job.minCgpa !== null ? Number(job.minCgpa) : config.rules.defaultMinCgpa;
  const studentCgpa = Number(student.cgpa || 0);
  if (studentCgpa < minCgpa) {
    reasons.push(`Minimum CGPA required is ${minCgpa.toFixed(2)}, but student has ${studentCgpa.toFixed(2)}.`);
  }

  // 2. Active Backlogs Check
  const maxBacklogs = job.maxBacklogs !== undefined && job.maxBacklogs !== null ? Number(job.maxBacklogs) : config.rules.defaultMaxAllowedBacklogs;
  const studentBacklogs = Number(student.activeBacklogs || 0);
  if (studentBacklogs > maxBacklogs) {
    reasons.push(`Maximum allowed active backlogs is ${maxBacklogs}, but student has ${studentBacklogs}.`);
  }

  // 3. Department Check
  if (job.allowedDepartments && job.allowedDepartments.trim() !== '') {
    let allowedList = [];
    try {
      if (job.allowedDepartments.startsWith('[') && job.allowedDepartments.endsWith(']')) {
        allowedList = JSON.parse(job.allowedDepartments).map(d => d.trim().toLowerCase());
      } else {
        allowedList = job.allowedDepartments.split(',').map(d => d.trim().toLowerCase());
      }
    } catch {
      allowedList = job.allowedDepartments.split(',').map(d => d.trim().toLowerCase());
    }

    const studentDept = (student.department || '').trim().toLowerCase();
    const isDeptAllowed = allowedList.some(d => d === '*' || d === 'all' || d === studentDept);

    if (!isDeptAllowed && allowedList.length > 0) {
      reasons.push(`Department "${student.department}" is not eligible for this job. Eligible departments: ${job.allowedDepartments}.`);
    }
  }

  // 4. One Offer / Placed Policy Check (Provisional)
  const allowMultipleOffers = options.allowMultipleOffers !== undefined 
    ? options.allowMultipleOffers 
    : config.rules.allowMultipleOffers;

  if (!allowMultipleOffers && options.studentApplications) {
    const isAlreadyHired = options.studentApplications.some(app => app.status === 'HIRED');
    if (isAlreadyHired) {
      reasons.push('Student has already accepted an offer and is marked as HIRED. College policy restricts further applications once placed.');
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
}

/**
 * Enforces student eligibility. Throws an error on violation.
 */
function checkStudentEligibilityRule(student, job, options = {}) {
  const evaluation = evaluateStudentEligibility(student, job, options);

  if (!evaluation.isEligible) {
    throw new BusinessRuleViolationError(
      RULE_NAME,
      `Student is not eligible for this job: ${evaluation.reasons.join(' ')}`,
      403,
      { reasons: evaluation.reasons, studentId: student?.id, jobId: job?.id }
    );
  }

  return true;
}

module.exports = {
  RULE_NAME,
  evaluateStudentEligibility,
  checkStudentEligibilityRule
};

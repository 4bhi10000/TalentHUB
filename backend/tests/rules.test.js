/**
 * Unit Tests for TalentHub Provisional Business Rules
 */
const {
  checkDuplicateApplicationRule,
  checkJobAcceptingApplicationsRule,
  evaluateStudentEligibility,
  checkStudentEligibilityRule,
  checkCompanyJobOwnershipRule,
  checkStudentProfileOwnershipRule,
  validateApplicationStatusTransitionRule,
  checkOfferAcceptanceRule,
  checkCoordinatorAccessRule,
  BusinessRuleViolationError
} = require('../src/rules');

describe('TalentHub Business Rules Test Suite', () => {

  describe('RULE_NO_DUPLICATE_APPLICATIONS', () => {
    it('should throw BusinessRuleViolationError when an application already exists', () => {
      const existingApplication = { id: 'app-1', status: 'APPLIED' };
      expect(() => {
        checkDuplicateApplicationRule(existingApplication, 'student-1', 'job-1');
      }).toThrow(BusinessRuleViolationError);

      try {
        checkDuplicateApplicationRule(existingApplication, 'student-1', 'job-1');
      } catch (err) {
        expect(err.statusCode).toBe(409);
        expect(err.ruleName).toBe('RULE_NO_DUPLICATE_APPLICATIONS');
        expect(err.message).toContain('Duplicate application rejected');
      }
    });

    it('should return true when no existing application is present', () => {
      expect(checkDuplicateApplicationRule(null, 'student-1', 'job-1')).toBe(true);
      expect(checkDuplicateApplicationRule(undefined, 'student-1', 'job-1')).toBe(true);
    });
  });

  describe('RULE_JOB_ACCEPTING_APPLICATIONS', () => {
    it('should throw error when job does not exist', () => {
      expect(() => checkJobAcceptingApplicationsRule(null)).toThrow(BusinessRuleViolationError);
    });

    it('should throw error when job status is CLOSED', () => {
      const job = { id: 'job-1', title: 'Software Engineer', status: 'CLOSED', deadline: new Date(Date.now() + 100000) };
      expect(() => checkJobAcceptingApplicationsRule(job)).toThrow(BusinessRuleViolationError);
    });

    it('should throw error when job deadline is in the past', () => {
      const pastDate = new Date(Date.now() - 10000);
      const job = { id: 'job-1', title: 'Software Engineer', status: 'OPEN', deadline: pastDate };
      expect(() => checkJobAcceptingApplicationsRule(job)).toThrow(BusinessRuleViolationError);
    });

    it('should pass when job is OPEN and deadline is in the future', () => {
      const futureDate = new Date(Date.now() + 1000000);
      const job = { id: 'job-1', title: 'Software Engineer', status: 'OPEN', deadline: futureDate };
      expect(checkJobAcceptingApplicationsRule(job)).toBe(true);
    });
  });

  describe('RULE_STUDENT_ELIGIBILITY', () => {
    const job = {
      id: 'job-1',
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedDepartments: 'Computer Science,Information Science'
    };

    it('should pass when student meets or exceeds all criteria (boundary case: exact CGPA & backlogs)', () => {
      const student = {
        id: 's-1',
        cgpa: 7.5,
        activeBacklogs: 0,
        department: 'Computer Science'
      };
      const evaluation = evaluateStudentEligibility(student, job);
      expect(evaluation.isEligible).toBe(true);
      expect(evaluation.reasons).toHaveLength(0);
      expect(checkStudentEligibilityRule(student, job)).toBe(true);
    });

    it('should fail when student CGPA is below requirement (boundary case: 7.49 < 7.50)', () => {
      const student = {
        id: 's-2',
        cgpa: 7.49,
        activeBacklogs: 0,
        department: 'Computer Science'
      };
      const evaluation = evaluateStudentEligibility(student, job);
      expect(evaluation.isEligible).toBe(false);
      expect(evaluation.reasons[0]).toContain('Minimum CGPA required is 7.50');
      expect(() => checkStudentEligibilityRule(student, job)).toThrow(BusinessRuleViolationError);
    });

    it('should fail when student has active backlogs exceeding threshold', () => {
      const student = {
        id: 's-3',
        cgpa: 8.5,
        activeBacklogs: 1,
        department: 'Computer Science'
      };
      const evaluation = evaluateStudentEligibility(student, job);
      expect(evaluation.isEligible).toBe(false);
      expect(evaluation.reasons[0]).toContain('Maximum allowed active backlogs is 0');
    });

    it('should fail when student department is not permitted', () => {
      const student = {
        id: 's-4',
        cgpa: 9.0,
        activeBacklogs: 0,
        department: 'Civil Engineering'
      };
      const evaluation = evaluateStudentEligibility(student, job);
      expect(evaluation.isEligible).toBe(false);
      expect(evaluation.reasons[0]).toContain('Civil Engineering" is not eligible');
    });

    it('should allow all departments when allowedDepartments is "All" or "*"', () => {
      const openJob = { ...job, allowedDepartments: 'All' };
      const student = {
        id: 's-5',
        cgpa: 8.0,
        activeBacklogs: 0,
        department: 'Mechanical'
      };
      expect(evaluateStudentEligibility(student, openJob).isEligible).toBe(true);
    });

    it('should prevent already HIRED students from applying when multiple offers are disabled', () => {
      const student = { id: 's-6', cgpa: 8.5, activeBacklogs: 0, department: 'Computer Science' };
      const studentApplications = [{ status: 'HIRED' }];
      const evaluation = evaluateStudentEligibility(student, job, {
        allowMultipleOffers: false,
        studentApplications
      });
      expect(evaluation.isEligible).toBe(false);
      expect(evaluation.reasons[0]).toContain('already accepted an offer and is marked as HIRED');
    });
  });

  describe('RULE_COMPANY_JOB_OWNERSHIP', () => {
    const job = { id: 'job-1', companyId: 'comp-123' };

    it('should pass when authenticated company owns the job', () => {
      expect(checkCompanyJobOwnershipRule('comp-123', job)).toBe(true);
    });

    it('should throw 403 BusinessRuleViolationError when another company tries to manage the job', () => {
      expect(() => checkCompanyJobOwnershipRule('comp-999', job)).toThrow(BusinessRuleViolationError);
      try {
        checkCompanyJobOwnershipRule('comp-999', job);
      } catch (err) {
        expect(err.statusCode).toBe(403);
        expect(err.ruleName).toBe('RULE_COMPANY_JOB_OWNERSHIP');
      }
    });
  });

  describe('RULE_STUDENT_PROFILE_OWNERSHIP', () => {
    it('should allow student to access their own profile', () => {
      expect(checkStudentProfileOwnershipRule('student-1', 'student-1', 'STUDENT')).toBe(true);
    });

    it('should allow coordinator to access any student profile', () => {
      expect(checkStudentProfileOwnershipRule(null, 'student-1', 'COORDINATOR')).toBe(true);
    });

    it('should reject student accessing another student profile', () => {
      expect(() => {
        checkStudentProfileOwnershipRule('student-1', 'student-2', 'STUDENT');
      }).toThrow(BusinessRuleViolationError);
    });
  });

  describe('RULE_APPLICATION_STATUS_TRANSITION', () => {
    it('should allow valid sequential transitions', () => {
      expect(validateApplicationStatusTransitionRule('APPLIED', 'SHORTLISTED')).toBe(true);
      expect(validateApplicationStatusTransitionRule('SHORTLISTED', 'INTERVIEW')).toBe(true);
      expect(validateApplicationStatusTransitionRule('INTERVIEW', 'OFFERED')).toBe(true);
      expect(validateApplicationStatusTransitionRule('OFFERED', 'HIRED')).toBe(true);
    });

    it('should allow rejection from intermediate stages', () => {
      expect(validateApplicationStatusTransitionRule('APPLIED', 'REJECTED')).toBe(true);
      expect(validateApplicationStatusTransitionRule('SHORTLISTED', 'REJECTED')).toBe(true);
      expect(validateApplicationStatusTransitionRule('INTERVIEW', 'REJECTED')).toBe(true);
      expect(validateApplicationStatusTransitionRule('OFFERED', 'REJECTED')).toBe(true);
    });

    it('should reject invalid state skips (e.g. APPLIED directly to HIRED)', () => {
      expect(() => {
        validateApplicationStatusTransitionRule('APPLIED', 'HIRED');
      }).toThrow(BusinessRuleViolationError);
    });

    it('should prevent transitions from terminal states (HIRED / REJECTED)', () => {
      expect(() => {
        validateApplicationStatusTransitionRule('HIRED', 'INTERVIEW');
      }).toThrow(BusinessRuleViolationError);

      expect(() => {
        validateApplicationStatusTransitionRule('REJECTED', 'SHORTLISTED');
      }).toThrow(BusinessRuleViolationError);
    });

    it('should reject unrecognized status strings', () => {
      expect(() => {
        validateApplicationStatusTransitionRule('APPLIED', 'PROMOTED');
      }).toThrow(BusinessRuleViolationError);
    });
  });

  describe('RULE_OFFER_ACCEPTANCE', () => {
    const validOffer = {
      id: 'offer-1',
      studentId: 'student-1',
      status: 'PENDING',
      deadline: new Date(Date.now() + 1000000)
    };

    it('should allow target student to ACCEPT a pending offer within deadline', () => {
      expect(checkOfferAcceptanceRule(validOffer, 'student-1', 'ACCEPTED')).toBe(true);
    });

    it('should allow target student to REJECT a pending offer', () => {
      expect(checkOfferAcceptanceRule(validOffer, 'student-1', 'REJECTED')).toBe(true);
    });

    it('should reject if decision is made by a different student', () => {
      expect(() => {
        checkOfferAcceptanceRule(validOffer, 'intruder-student', 'ACCEPTED');
      }).toThrow(BusinessRuleViolationError);
    });

    it('should reject if offer status is not PENDING (already ACCEPTED or REJECTED)', () => {
      const acceptedOffer = { ...validOffer, status: 'ACCEPTED' };
      expect(() => {
        checkOfferAcceptanceRule(acceptedOffer, 'student-1', 'ACCEPTED');
      }).toThrow(BusinessRuleViolationError);
    });

    it('should reject if offer has expired', () => {
      const expiredOffer = {
        ...validOffer,
        deadline: new Date(Date.now() - 50000)
      };
      expect(() => {
        checkOfferAcceptanceRule(expiredOffer, 'student-1', 'ACCEPTED');
      }).toThrow(BusinessRuleViolationError);
    });

    it('should reject acceptance if student already accepted another offer and policy forbids multiple offers', () => {
      expect(() => {
        checkOfferAcceptanceRule(validOffer, 'student-1', 'ACCEPTED', {
          allowMultipleOffers: false,
          hasExistingAcceptedOffer: true
        });
      }).toThrow(BusinessRuleViolationError);
    });
  });

  describe('RULE_COORDINATOR_ACCESS', () => {
    it('should permit access when role is COORDINATOR', () => {
      expect(checkCoordinatorAccessRule('COORDINATOR')).toBe(true);
    });

    it('should deny access when role is STUDENT or COMPANY', () => {
      expect(() => checkCoordinatorAccessRule('STUDENT')).toThrow(BusinessRuleViolationError);
      expect(() => checkCoordinatorAccessRule('COMPANY')).toThrow(BusinessRuleViolationError);
    });
  });
});

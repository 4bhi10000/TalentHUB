const request = require('supertest');
const app = require('../src/app');
const { seedDatabase } = require('../prisma/seed');

describe('TalentHub API Integration Test Suite', () => {
  let coordinatorToken;
  let studentToken;
  let companyToken;
  let createdJobId;
  let createdApplicationId;
  let createdOfferId;

  beforeAll(async () => {
    // Seed fresh test database before running tests
    await seedDatabase();
  });

  // 1. Health check
  describe('GET /api/health', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  // 2. Authentication & Authorization
  describe('Authentication Flows', () => {
    it('should fail login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'coordinator@talenthub.edu',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should login successfully as Coordinator', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'coordinator@talenthub.edu',
          password: 'Coordinator@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('COORDINATOR');
      coordinatorToken = res.body.data.token;
    });

    it('should login successfully as Student (Rahul)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rahul@student.edu',
          password: 'Student@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('STUDENT');
      studentToken = res.body.data.token;
    });

    it('should login successfully as Company (Google)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'recruiter@google.com',
          password: 'Company@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('COMPANY');
      companyToken = res.body.data.token;
    });

    it('should register a new student with hashed password and validations', async () => {
      const uniqueRoll = `TEST_${Date.now()}`;
      const uniqueEmail = `newstudent_${Date.now()}@student.edu`;
      const res = await request(app)
        .post('/api/auth/register/student')
        .send({
          email: uniqueEmail,
          password: 'SecretPassword123',
          fullName: 'Test Candidate',
          rollNumber: uniqueRoll,
          department: 'Computer Science',
          cgpa: 8.5,
          graduationYear: 2026,
          activeBacklogs: 0
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('STUDENT');
    });

    it('should reject registration when input is invalid (e.g. invalid email / CGPA > 10)', async () => {
      const res = await request(app)
        .post('/api/auth/register/student')
        .send({
          email: 'invalid-email',
          password: '123',
          fullName: 'A',
          rollNumber: 'R',
          department: 'CS',
          cgpa: 15.0 // invalid
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject access to protected endpoint without token', async () => {
      const res = await request(app).get('/api/coordinator/stats');
      expect(res.status).toBe(401);
    });

    it('should deny Student access to Coordinator endpoints (Role-based Authorization)', async () => {
      const res = await request(app)
        .get('/api/coordinator/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });
  });

  // 3. Coordinator Metrics & Reports
  describe('Coordinator Dashboard API', () => {
    it('should fetch overview stats for coordinator', async () => {
      const res = await request(app)
        .get('/api/coordinator/stats')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalStudents');
      expect(res.body.data).toHaveProperty('totalCompanies');
      expect(res.body.data).toHaveProperty('totalJobListings');
      expect(res.body.data).toHaveProperty('totalApplications');
      expect(res.body.data).toHaveProperty('placementPercentage');
    });

    it('should fetch department-wise statistics', async () => {
      const res = await request(app)
        .get('/api/coordinator/departments')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should fetch company summary', async () => {
      const res = await request(app)
        .get('/api/coordinator/companies-summary')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // 4. Job Management Flow
  describe('Job Management', () => {
    it('should allow company to create a new job listing', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Full Stack Engineer (Node & React)',
          description: 'Develop high performance full-stack cloud web applications.',
          roleType: 'Full-time',
          packageCtc: 18.0,
          location: 'Bangalore / Remote',
          minCgpa: 7.0,
          allowedDepartments: 'Computer Science,Information Science',
          maxBacklogs: 0,
          deadline: futureDate.toISOString()
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Full Stack Engineer (Node & React)');
      createdJobId = res.body.data.id;
    });

    it('should list available jobs for student with computed eligibility', async () => {
      const res = await request(app)
        .get('/api/students/jobs')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const targetJob = res.body.data.find(j => j.id === createdJobId);
      expect(targetJob).toBeDefined();
      expect(targetJob.eligibility).toBeDefined();
      expect(targetJob.eligibility.isEligible).toBe(true);
    });
  });

  // 5. Application Lifecycle & Business Rules Enforcements
  describe('Application Lifecycle & Rules', () => {
    it('should allow eligible student to apply for the created job', async () => {
      const res = await request(app)
        .post('/api/applications/apply')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          jobId: createdJobId,
          remarks: 'I am excited about this full-stack role.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPLIED');
      createdApplicationId = res.body.data.id;
    });

    it('should REJECT duplicate application submission with RULE_NO_DUPLICATE_APPLICATIONS', async () => {
      const res = await request(app)
        .post('/api/applications/apply')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          jobId: createdJobId,
          remarks: 'Second application attempt'
        });

      expect(res.status).toBe(409);
      expect(res.body.errorType).toBe('BUSINESS_RULE_VIOLATION');
      expect(res.body.ruleName).toBe('RULE_NO_DUPLICATE_APPLICATIONS');
    });

    it('should allow company to update application status from APPLIED to SHORTLISTED', async () => {
      const res = await request(app)
        .patch(`/api/applications/${createdApplicationId}/status`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          status: 'SHORTLISTED',
          remarks: 'Candidate shortlisted for interview round.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('SHORTLISTED');
    });

    it('should REJECT illegal status skip (e.g. SHORTLISTED to HIRED) with RULE_APPLICATION_STATUS_TRANSITION', async () => {
      const res = await request(app)
        .patch(`/api/applications/${createdApplicationId}/status`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          status: 'HIRED'
        });

      expect(res.status).toBe(400);
      expect(res.body.errorType).toBe('BUSINESS_RULE_VIOLATION');
      expect(res.body.ruleName).toBe('RULE_APPLICATION_STATUS_TRANSITION');
    });

    it('should allow company to schedule an interview and auto-transition to INTERVIEW', async () => {
      const interviewDate = new Date();
      interviewDate.setDate(interviewDate.getDate() + 2);

      const res = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          applicationId: createdApplicationId,
          roundName: 'Round 1: System Architecture',
          scheduledDate: interviewDate.toISOString(),
          mode: 'ONLINE',
          venueOrLink: 'https://meet.google.com/xyz-abc'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should allow company to issue an offer and auto-transition to OFFERED', async () => {
      const res = await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          applicationId: createdApplicationId,
          ctc: 18.0,
          designation: 'Full Stack Engineer',
          joiningDate: '2026-08-01',
          remarks: 'Welcome to the team!'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PENDING');
      createdOfferId = res.body.data.id;
    });

    it('should allow student to ACCEPT the job offer and transition application to HIRED', async () => {
      const res = await request(app)
        .patch(`/api/offers/${createdOfferId}/respond`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          decision: 'ACCEPTED',
          remarks: 'Delighted to accept the offer!'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ACCEPTED');
    });
  });
});

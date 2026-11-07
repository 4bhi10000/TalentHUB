# TalentHub – Campus Placement Management System

TalentHub is an end-to-end, enterprise-grade Campus Placement Management System built with a **decoupled business rule architecture**. It centralizes the university placement lifecycle across three distinct stakeholder roles: **STUDENT**, **COMPANY**, and **COORDINATOR**.

---

## 1. Key Features

- **Role-Based Portals:**
  - **STUDENT:** Academic profile management, real-time job eligibility calculation, one-click application submission with duplicate prevention, 5-stage visual progress stepper, interview schedule tracking, and formal offer acceptance/rejection.
  - **COMPANY:** Recruiter company profile, job listing creation with custom eligibility constraints (CGPA, allowed departments, maximum backlogs, deadline), candidate applicant pipeline management, interview scheduling with virtual links/venues, and verified offer letter issuance.
  - **COORDINATOR:** Institutional governance dashboard, placement KPIs (total students, companies, job listings, applications, placed students, placement rate %), department-wise breakdown, company recruitment summary, and complete audit reports.
- **Architectural Business Rule Engine:**
  - Pure, isolated business rule functions (`src/rules/`) decoupled from Express controllers and database logic.
  - Configurable limits and provisional rule thresholds in `src/config/appConfig.js`.
  - Detailed error reporting via standard `BusinessRuleViolationError` and HTTP error codes.
  - Centralized application state machine validation (`APPLIED` → `SHORTLISTED` → `INTERVIEW` → `OFFERED` → `HIRED` / `REJECTED`).
- **Database & Security:**
  - SQLite with Prisma ORM and strict foreign key enforcement.
  - Database-level unique constraints preventing duplicate applications.
  - Multi-step database operations wrapped in Prisma transactions.
  - Password hashing with `bcryptjs` and stateless JWT authorization.
  - Input validation using `Zod` schemas.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite, React Router 6, Bootstrap 5, Lucide Icons, Plus Jakarta Sans typography.
- **Backend:** Node.js, Express.js, CORS, Dotenv.
- **Database & ORM:** SQLite, Prisma ORM.
- **Authentication & Validation:** JWT (`jsonwebtoken`), `bcryptjs`, `Zod`.
- **Testing:** Jest, Supertest.

---

## 3. Project Directory Structure

```
TalentHub/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Prisma SQLite Schema (Entities: User, Student, Company, JobListing, Application, Interview, Offer)
│   │   ├── migrations/              # SQLite SQL Migrations
│   │   └── seed.js                  # Database seeder with sample accounts
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── appConfig.js         # Configurable thresholds, limits & status transition matrix
│   │   │   └── database.js          # Prisma client with SQLite foreign key enforcement
│   │   ├── rules/                   # PURE BUSINESS RULES LAYER (No controllers, no DB queries)
│   │   │   ├── BusinessRuleViolationError.js
│   │   │   ├── checkDuplicateApplicationRule.js
│   │   │   ├── checkJobAcceptingApplicationsRule.js
│   │   │   ├── checkStudentEligibilityRule.js
│   │   │   ├── checkCompanyJobOwnershipRule.js
│   │   │   ├── checkStudentProfileOwnershipRule.js
│   │   │   ├── validateApplicationStatusTransitionRule.js
│   │   │   ├── checkOfferAcceptanceRule.js
│   │   │   ├── checkCoordinatorAccessRule.js
│   │   │   └── index.js
│   │   ├── repositories/            # Data Access Layer (Prisma Queries & Transactions)
│   │   │   ├── userRepository.js
│   │   │   ├── studentRepository.js
│   │   │   ├── companyRepository.js
│   │   │   ├── jobRepository.js
│   │   │   ├── applicationRepository.js
│   │   │   ├── interviewRepository.js
│   │   │   ├── offerRepository.js
│   │   │   └── coordinatorRepository.js
│   │   ├── services/                # Business Orchestration (Invokes Rules & Repositories)
│   │   │   ├── authService.js
│   │   │   ├── studentService.js
│   │   │   ├── companyService.js
│   │   │   ├── jobService.js
│   │   │   ├── applicationService.js
│   │   │   ├── interviewService.js
│   │   │   ├── offerService.js
│   │   │   └── coordinatorService.js
│   │   ├── controllers/             # HTTP Handlers (No Business Logic)
│   │   ├── routes/                  # Express Router Modules & Middlewares
│   │   ├── middleware/              # Auth, Role Guard, Zod Validator, Error Handler
│   │   ├── validators/              # Zod Input Schemas
│   │   └── app.js                   # Express application setup
│   │
│   ├── server.js                    # Server startup script (Port 5000)
│   ├── tests/                       # Unit & Integration Tests (Jest & Supertest)
│   │   ├── rules.test.js
│   │   └── api.test.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/                     # Centralized API Client with token injection
│   │   ├── context/                 # AuthContext (login, register, session)
│   │   ├── components/              # Navbar, Badges, Stepper, Alerts
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Public Landing
│   │   │   ├── LoginPage.jsx        # Login with 1-click Demo Credentials
│   │   │   ├── RegisterPage.jsx     # Student & Company Registration
│   │   │   ├── student/             # Student Dashboard (Jobs, Apps, Interviews, Offers)
│   │   │   ├── company/             # Company Dashboard (Post Jobs, Pipeline, Interviews, Offers)
│   │   │   └── coordinator/         # Coordinator Dashboard (KPIs, Reports, Departments)
│   │   ├── styles/                  # Custom modern CSS + Bootstrap
│   │   ├── App.jsx                  # Protected Route setup
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
│
├── RULES.md                         # Detailed Business Rules Architecture Specification
├── README.md                        # Documentation & Setup Guide
└── .gitignore
```

---

## 4. Demo Login Credentials

The seed script initializes sample institutional accounts with realistic data:

| Role | Name / Description | Email | Password |
| :--- | :--- | :--- | :--- |
| **COORDINATOR** | Campus Placement Cell | `coordinator@talenthub.edu` | `Coordinator@123` |
| **COMPANY** | Google Cloud & AI | `recruiter@google.com` | `Company@123` |
| **COMPANY** | Microsoft Corporation | `recruiter@microsoft.com` | `Company@123` |
| **COMPANY** | Tata Consultancy Services | `recruiter@tcs.com` | `Company@123` |
| **STUDENT** | Rahul Sharma (CSE, 8.75 CGPA) | `rahul@student.edu` | `Student@123` |
| **STUDENT** | Priya Patel (ISE, 9.35 CGPA, Placed) | `priya@student.edu` | `Student@123` |
| **STUDENT** | Amit Kumar (ECE, 7.15 CGPA, 1 Backlog) | `amit@student.edu` | `Student@123` |
| **STUDENT** | Sneha Reddy (ME, 6.45 CGPA) | `sneha@student.edu` | `Student@123` |

> **Tip:** On the Login page (`/login`), click any role button under **Quick Demo Autofill** to instantly populate credentials.

---

## 5. Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended; developed on Node v24)
- npm

### Step 1: Clone or Navigate to Directory
```bash
cd TalentHub
```

### Step 2: Backend Setup
```bash
cd backend
npm install

# Copy environment variables
copy .env.example .env

# Run Prisma Migrations
npx prisma migrate dev --name init

# Populate Database with Demo Data
node prisma/seed.js
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 6. Running the Application

### Start Backend Server (Port 5000)
Open a terminal in `backend/`:
```bash
npm start
# or npm run dev (for nodemon live reload)
```
- Health Check: `http://localhost:5000/api/health`

### Start Frontend Application (Port 3000)
Open another terminal in `frontend/`:
```bash
npm run dev
```
- Open your browser at: `http://localhost:3000`

---

## 7. Running Tests

The test suite covers:
- Unit tests for all 8 business rules (boundary cases, negative cases, threshold enforcement).
- Integration tests for registration, password hashing, JWT authentication, role guards, job posting, eligibility evaluation, duplicate prevention, status transitions, interview scheduling, and offer acceptance.

To execute tests:
```bash
cd backend
npm test
```
All **51 test cases** will run sequentially with isolated in-memory test database seeding.

---

## 8. REST API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register/student` – Register student account with academic details.
- `POST /api/auth/register/company` – Register corporate recruiter account.
- `POST /api/auth/login` – Login and receive JWT token.
- `GET /api/auth/me` – Retrieve currently authenticated user context [Protected].

### Student Management (`/api/students`)
- `GET /api/students/profile` – Get student academic profile [Student].
- `PUT /api/students/profile` – Update student profile [Student].
- `GET /api/students/jobs` – List open jobs with computed eligibility badges [Student].
- `GET /api/students/applications` – List student's submitted applications [Student].

### Company Management (`/api/companies`)
- `GET /api/companies/profile` – Get company profile [Company].
- `PUT /api/companies/profile` – Update company details [Company].
- `GET /api/companies/jobs` – List company's posted jobs [Company].
- `GET /api/companies/applicants` – List candidate applications with status filters [Company].

### Job Listings (`/api/jobs`)
- `GET /api/jobs` – List all jobs with search/status filters [Public/Authenticated].
- `GET /api/jobs/:id` – Get job details [Public/Authenticated].
- `POST /api/jobs` – Post new job listing with criteria [Company].
- `PUT /api/jobs/:id` – Update job listing [Company Owner].
- `PATCH /api/jobs/:id/status` – Toggle OPEN/CLOSED status [Company Owner].

### Applications (`/api/applications`)
- `POST /api/applications/apply` – Submit job application [Student].
  - Checks: duplicate rule, job open/expired rule, student eligibility rule.
- `PATCH /api/applications/:id/status` – Update application status [Company Owner].
  - Enforces: centralized status transition validator.
- `GET /api/applications/job/:jobId` – Get all applicants for a job [Company Owner].
- `GET /api/applications/:id` – View specific application details [Authorized].

### Interviews (`/api/interviews`)
- `POST /api/interviews` – Schedule interview round [Company Owner].
- `PATCH /api/interviews/:id` – Record result and recruiter feedback [Company Owner].
- `GET /api/interviews/student` – Get student's scheduled interviews [Student].
- `GET /api/interviews/company` – Get company's scheduled interviews [Company].

### Offers (`/api/offers`)
- `POST /api/offers` – Issue official job offer [Company Owner].
- `PATCH /api/offers/:id/respond` – Accept or decline offer [Target Student].
  - Enforces: single-offer policy, offer status check, expiration deadline.
- `GET /api/offers/student` – List offers received by student [Student].
- `GET /api/offers/company` – List offers issued by company [Company].

### Coordinator Governance (`/api/coordinator`)
- `GET /api/coordinator/stats` – Overview placement KPIs [Coordinator].
- `GET /api/coordinator/departments` – Department-wise placement rate [Coordinator].
- `GET /api/coordinator/companies-summary` – Company recruitment metrics [Coordinator].
- `GET /api/coordinator/applications-report` – Full applications audit log with filters [Coordinator].
- `GET /api/coordinator/students` – Complete student directory [Coordinator].
- `GET /api/coordinator/companies` – Registered companies list [Coordinator].

---

## 9. Business Rule Governance

Refer to [RULES.md](file:///d:/Talenthub/RULES.md) for full documentation of:
- `RULE_NO_DUPLICATE_APPLICATIONS`
- `RULE_JOB_ACCEPTING_APPLICATIONS`
- `RULE_STUDENT_ELIGIBILITY`
- `RULE_COMPANY_JOB_OWNERSHIP`
- `RULE_STUDENT_PROFILE_OWNERSHIP`
- `RULE_APPLICATION_STATUS_TRANSITION`
- `RULE_OFFER_ACCEPTANCE`
- `RULE_COORDINATOR_ACCESS`

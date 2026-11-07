# TalentHub – Business Rule Architecture (RULES.md)

> **Notice:** The business rules documented below are provisional operational rules developed to establish the core workflow of TalentHub. All rules are isolated from Express controllers and database queries, located strictly under `backend/src/rules/` and configured via `backend/src/config/appConfig.js`. When the university faculty placement manual is officially released, these rules can be updated or replaced without rewriting controllers or routes.

---

## 1. Architecture Overview

```
TalentHub Architecture:
[ Client / Frontend ]
        │
        ▼ HTTP REST / JSON
[ Express Routes & Middleware ] (Authentication, Zod Schema Validation, Role Guard)
        │
        ▼
[ Controllers ] (Orchestration ONLY; Zero Business Logic)
        │
        ▼
[ Services ] ──────► Calls Pure Business Rules in `src/rules/`
        │                     (Throws BusinessRuleViolationError if rule fails)
        ▼
[ Repositories ] ──► Prisma ORM ──► SQLite (with Foreign Key Enforcement)
```

Each rule is a standalone, deterministic function that:
- Has a unique, uppercase descriptive name (e.g., `RULE_NO_DUPLICATE_APPLICATIONS`).
- Takes context parameters (e.g., student, job, user role).
- Evaluates conditions against thresholds defined in `src/config/appConfig.js`.
- Throws a descriptive `BusinessRuleViolationError` with a distinct HTTP status code (`400`, `403`, `404`, or `409`) and structured debug details.

---

## 2. Implemented Provisional Business Rules

### Rule 1: `RULE_NO_DUPLICATE_APPLICATIONS`
- **File Location:** `backend/src/rules/checkDuplicateApplicationRule.js`
- **Status:** Provisional
- **Purpose:** Prevents a candidate from submitting more than one application to the exact same job listing.
- **Enforcement Layers:**
  1. Service layer: checks `checkDuplicateApplicationRule(existingApplication, studentId, jobId)`.
  2. Database layer: SQLite unique composite index on `(studentId, jobId)`.
- **Expected Error:**
  - **Status Code:** `409 Conflict`
  - **Message:** `"Duplicate application rejected: Student has already applied for this job listing (Current status: <status>)."`
  - **Details:** `{ studentId, jobId, existingApplicationId, currentStatus }`

---

### Rule 2: `RULE_JOB_ACCEPTING_APPLICATIONS`
- **File Location:** `backend/src/rules/checkJobAcceptingApplicationsRule.js`
- **Status:** Provisional
- **Purpose:** Ensures that students can only submit applications for job listings that are currently marked as `OPEN` and whose application deadline has not elapsed.
- **Inputs:** `job` entity, `currentDate` (defaults to `new Date()`).
- **Expected Errors:**
  - If job not found:
    - **Status Code:** `404 Not Found`
    - **Message:** `"Application rejected: The specified job listing does not exist."`
  - If job is `CLOSED`:
    - **Status Code:** `400 Bad Request`
    - **Message:** `"Application rejected: Job listing \"<title>\" is currently CLOSED for new applications."`
  - If deadline has expired:
    - **Status Code:** `400 Bad Request`
    - **Message:** `"Application rejected: The application deadline for \"<title>\" expired on <YYYY-MM-DD>."`

---

### Rule 3: `RULE_STUDENT_ELIGIBILITY`
- **File Location:** `backend/src/rules/checkStudentEligibilityRule.js`
- **Status:** Provisional
- **Purpose:** Verifies whether a student meets the academic criteria established by the recruiting company for a specific job:
  1. **CGPA Criterion:** Student CGPA $\ge$ Job `minCgpa` (default threshold in `appConfig.js`: `0.0`).
  2. **Active Backlogs:** Student `activeBacklogs` $\le$ Job `maxBacklogs` (default threshold: `0`).
  3. **Department / Branch:** Student `department` must match the job's `allowedDepartments` (or wildcard `"All"` / `"*"`).
  4. **Single Offer Policy:** If `allowMultipleOffers` is `false`, students who have already accepted an offer (status `HIRED`) are restricted from applying further.
- **Pure Evaluator Provided:** `evaluateStudentEligibility(student, job, options)` returns `{ isEligible: boolean, reasons: string[] }` used by the frontend to render real-time eligibility badges and explanatory tooltips.
- **Expected Error (on submit):**
  - **Status Code:** `403 Forbidden`
  - **Message:** `"Student is not eligible for this job: <reasons>"`
  - **Details:** `{ reasons: [...], studentId, jobId }`

---

### Rule 4: `RULE_COMPANY_JOB_OWNERSHIP`
- **File Location:** `backend/src/rules/checkCompanyJobOwnershipRule.js`
- **Status:** Provisional
- **Purpose:** Enforces organizational isolation. Only the company profile that created a job listing has authorization to manage its applicants, modify job parameters, schedule interviews, and issue job offers.
- **Inputs:** `authenticatedCompanyId`, `job` entity.
- **Expected Errors:**
  - If job not found:
    - **Status Code:** `404 Not Found`
    - **Message:** `"Operation failed: Job listing could not be found."`
  - If company ID does not match `job.companyId`:
    - **Status Code:** `403 Forbidden`
    - **Message:** `"Access denied: You do not have permission to manage applicants or job details for a listing owned by another company."`
    - **Details:** `{ authenticatedCompanyId, jobCompanyId, jobId }`

---

### Rule 5: `RULE_STUDENT_PROFILE_OWNERSHIP`
- **File Location:** `backend/src/rules/checkStudentProfileOwnershipRule.js`
- **Status:** Provisional
- **Purpose:** Ensures candidate privacy. Students may only view and modify their own academic profile. Cross-student data modifications or unauthorized queries are strictly prohibited. Placement Coordinators are granted read access for administrative audits.
- **Inputs:** `authenticatedStudentId`, `targetStudentId`, `role`.
- **Expected Error:**
  - **Status Code:** `403 Forbidden`
  - **Message:** `"Access denied: You are only authorized to access and modify your own student profile."`

---

### Rule 6: `RULE_APPLICATION_STATUS_TRANSITION`
- **File Location:** `backend/src/rules/validateApplicationStatusTransitionRule.js`
- **Status:** Provisional
- **Purpose:** Centralized finite state machine validator for application lifecycle. Prevents illegal state jumps (e.g. from `APPLIED` straight to `HIRED` or updating a `REJECTED` application).
- **Allowed Transition Matrix:**
  | Current Status | Allowed Target Statuses | Notes |
  | :--- | :--- | :--- |
  | `APPLIED` | `SHORTLISTED`, `REJECTED` | Initial candidate submission |
  | `SHORTLISTED` | `INTERVIEW`, `REJECTED` | Screening cleared, round scheduling permitted |
  | `INTERVIEW` | `OFFERED`, `REJECTED` | Technical rounds completed |
  | `OFFERED` | `HIRED`, `REJECTED` | Pending candidate acceptance |
  | `HIRED` | *None* | Terminal state (Candidate placed) |
  | `REJECTED` | *None* | Terminal state (Application closed) |
- **Expected Errors:**
  - If target status string is invalid:
    - **Status Code:** `400 Bad Request`
    - **Message:** `"Invalid application status: \"<status>\". Must be one of: APPLIED, SHORTLISTED, INTERVIEW, OFFERED, HIRED, REJECTED."`
  - If transition is illegal:
    - **Status Code:** `400 Bad Request`
    - **Message:** `"Illegal application status transition: Cannot transition from \"<from>\" to \"<to>\". Allowed transitions: <allowed>."`

---

### Rule 7: `RULE_OFFER_ACCEPTANCE`
- **File Location:** `backend/src/rules/checkOfferAcceptanceRule.js`
- **Status:** Provisional
- **Purpose:** Governs the formal job offer response protocol:
  1. Only the candidate to whom the offer was issued can respond.
  2. The offer must currently be in `PENDING` status.
  3. The offer response must be submitted before the offer's `deadline`.
  4. If `allowMultipleOffers` is `false`, a candidate cannot accept a second offer if already placed.
- **Expected Errors:**
  - Unauthorized candidate: `403 Forbidden` (`"Access denied: You are not authorized to respond to an offer issued to another student."`)
  - Already resolved offer: `400 Bad Request` (`"Offer decision rejected: This offer has already been resolved with status \"<status>\"."`)
  - Expired deadline: `400 Bad Request` (`"Offer decision rejected: This offer expired on <YYYY-MM-DD>."`)
  - Multiple offer violation: `400 Bad Request` (`"Offer acceptance rejected: Institutional policy permits only one accepted placement offer per student."`)

---

### Rule 8: `RULE_COORDINATOR_ACCESS`
- **File Location:** `backend/src/rules/checkCoordinatorAccessRule.js`
- **Status:** Provisional
- **Purpose:** Enforces administrative access control. Placement statistics, aggregate cohort reports, and institutional audits are strictly restricted to the `COORDINATOR` role.
- **Expected Error:**
  - **Status Code:** `403 Forbidden`
  - **Message:** `"Access denied: Placement reports and institutional statistics are restricted to Placement Coordinators only."`

---

## 3. Configuration Parameters (`src/config/appConfig.js`)

| Config Parameter | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `rules.allowMultipleOffers` | Boolean | `false` | Enables/disables holding multiple accepted offers |
| `rules.defaultOfferValidityDays` | Number | `7` | Days an offer remains valid if company omits deadline |
| `rules.defaultMinCgpa` | Number | `0.0` | Fallback minimum CGPA |
| `rules.defaultMaxAllowedBacklogs` | Number | `0` | Fallback maximum allowed backlogs |
| `rules.allowedStatusTransitions` | Object | Standard matrix | State transition lookup table |

---

## 4. How to Update Rules When Official Guidance Arrives

1. **Change a Threshold:** Update the corresponding variable in `backend/src/config/appConfig.js` or via environment variables in `.env`.
2. **Modify Rule Logic:** Edit the specific rule function inside `backend/src/rules/`. Because controllers only call services and services invoke these pure functions, zero controller or routing changes are required.
3. **Verify:** Run `npm test` inside `backend` to ensure the full test suite passes.

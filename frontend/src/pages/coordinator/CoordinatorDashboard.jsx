import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Award,
  TrendingUp,
  Percent,
  DollarSign,
  Download,
  Filter,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Layers,
  BookOpen
} from 'lucide-react';

export default function CoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reports', 'departments', 'companies', 'students', 'rules'
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [companySummary, setCompanySummary] = useState([]);
  const [report, setReport] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Report filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const loadCoordinatorData = async () => {
    setLoading(true);
    try {
      const [statsRes, deptRes, compSumRes, reportRes, studentsRes, companiesRes] = await Promise.all([
        api.get('/coordinator/stats'),
        api.get('/coordinator/departments'),
        api.get('/coordinator/companies-summary'),
        api.get('/coordinator/applications-report'),
        api.get('/coordinator/students'),
        api.get('/coordinator/companies')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (compSumRes.success) setCompanySummary(compSumRes.data);
      if (reportRes.success) setReport(reportRes.data);
      if (studentsRes.success) setStudents(studentsRes.data);
      if (companiesRes.success) setCompanies(companiesRes.data);
    } catch (err) {
      console.error('Failed to load coordinator data:', err);
      setAlert({ type: 'danger', message: err.message || 'Error loading placement data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoordinatorData();
  }, []);

  // Filtered reports
  const filteredReport = report.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (departmentFilter && item.student?.department !== departmentFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status"></div>
        <div className="mt-2 text-muted">Aggregating campus placement metrics...</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Placement Cell Header */}
      <div className="hub-card p-4 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="fw-bold mb-0">Placement Cell Operations & Analytics</h3>
              <span className="badge bg-warning-subtle text-warning border px-2 py-1">
                COORDINATOR
              </span>
            </div>
            <p className="text-muted small mb-0">
              Institutional governance console: audit student eligibility, monitor company drives, and export placement performance.
            </p>
          </div>

          <button
            onClick={() => {
              window.print();
            }}
            className="btn btn-outline-hub d-flex align-items-center gap-2"
          >
            <Download size={16} />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show d-flex align-items-center gap-2`} role="alert">
          {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{alert.message}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {/* KPI CARDS (Section 8 Requirements) */}
      <div className="row g-3 mb-4">
        {/* Total Registered Students */}
        <div className="col-6 col-lg-2">
          <div className="stat-box p-3 h-100 flex-column align-items-start">
            <div className="stat-icon bg-primary-subtle text-primary mb-2" style={{ width: '42px', height: '42px' }}>
              <Users size={20} />
            </div>
            <div className="text-muted small">Registered Students</div>
            <div className="fs-3 fw-bold">{stats?.totalStudents || 0}</div>
          </div>
        </div>

        {/* Total Companies */}
        <div className="col-6 col-lg-2">
          <div className="stat-box p-3 h-100 flex-column align-items-start">
            <div className="stat-icon bg-info-subtle text-info mb-2" style={{ width: '42px', height: '42px' }}>
              <Building2 size={20} />
            </div>
            <div className="text-muted small">Total Companies</div>
            <div className="fs-3 fw-bold">{stats?.totalCompanies || 0}</div>
          </div>
        </div>

        {/* Total JobListings */}
        <div className="col-6 col-lg-2">
          <div className="stat-box p-3 h-100 flex-column align-items-start">
            <div className="stat-icon bg-purple-subtle text-purple mb-2" style={{ backgroundColor: '#f3e8ff', color: '#9333ea', width: '42px', height: '42px' }}>
              <Briefcase size={20} />
            </div>
            <div className="text-muted small">Job Listings</div>
            <div className="fs-3 fw-bold">
              {stats?.totalJobListings || 0} <span className="fs-7 text-success">({stats?.openJobListings} Open)</span>
            </div>
          </div>
        </div>

        {/* Total Applications */}
        <div className="col-6 col-lg-2">
          <div className="stat-box p-3 h-100 flex-column align-items-start">
            <div className="stat-icon bg-secondary-subtle text-secondary mb-2" style={{ width: '42px', height: '42px' }}>
              <FileText size={20} />
            </div>
            <div className="text-muted small">Applications</div>
            <div className="fs-3 fw-bold">{stats?.totalApplications || 0}</div>
          </div>
        </div>

        {/* Total Placed Students */}
        <div className="col-6 col-lg-2">
          <div className="stat-box p-3 h-100 flex-column align-items-start">
            <div className="stat-icon bg-success-subtle text-success mb-2" style={{ width: '42px', height: '42px' }}>
              <Award size={20} />
            </div>
            <div className="text-muted small">Placed Students</div>
            <div className="fs-3 fw-bold text-success">{stats?.totalPlacedStudents || 0}</div>
          </div>
        </div>

        {/* Placement Percentage */}
        <div className="col-6 col-lg-2">
          <div className="stat-box p-3 h-100 flex-column align-items-start border-primary-subtle">
            <div className="stat-icon bg-primary text-white mb-2" style={{ width: '42px', height: '42px' }}>
              <Percent size={20} />
            </div>
            <div className="text-muted small">Placement Rate</div>
            <div className="fs-3 fw-bold text-primary">{stats?.placementPercentage || 0}%</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={16} />
            <span>Placement Overview</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={16} />
            <span>Applications Report ({report.length})</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            <Layers size={16} />
            <span>Department Breakdown</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            <Building2 size={16} />
            <span>Company Summary</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={16} />
            <span>Student Registry</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <BookOpen size={16} />
            <span>Governance Rules</span>
          </button>
        </li>
      </ul>

      {/* TAB 1: PLACEMENT OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          {/* Salary Package Highlights */}
          <div className="col-md-6">
            <div className="hub-card p-4 h-100">
              <h5 className="fw-bold mb-3">Salary & Package Highlights</h5>
              <div className="d-flex justify-content-between p-3 bg-light rounded border mb-3">
                <div>
                  <div className="text-muted small">Highest Package Offered</div>
                  <div className="fs-3 fw-bold text-success">{stats?.highestCtc ? `${stats.highestCtc} LPA` : '0 LPA'}</div>
                </div>
                <div className="text-end">
                  <div className="text-muted small">Average Package</div>
                  <div className="fs-3 fw-bold text-primary">{stats?.averageCtc ? `${stats.averageCtc} LPA` : '0 LPA'}</div>
                </div>
              </div>

              <div className="text-muted small">
                Data reflects verified accepted offers across the 2026 graduation cohort.
              </div>
            </div>
          </div>

          {/* Department Placement Summary */}
          <div className="col-md-6">
            <div className="hub-card p-4 h-100">
              <h5 className="fw-bold mb-3">Department Highlights</h5>
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Branch</th>
                      <th>Registered</th>
                      <th>Placed</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d) => (
                      <tr key={d.department}>
                        <td className="fw-semibold">{d.department}</td>
                        <td>{d.totalStudents}</td>
                        <td>{d.placedStudents}</td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border">
                            {d.placementPercentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATIONS REPORT (AUDIT) */}
      {activeTab === 'reports' && (
        <div>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <h5 className="fw-bold mb-0">Centralized Applications Audit Trail</h5>

            {/* Filters */}
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="APPLIED">Applied</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFERED">Offered</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                className="form-select form-select-sm"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Science">Information Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>
          </div>

          <div className="hub-card overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Student</th>
                    <th>Branch</th>
                    <th>CGPA</th>
                    <th>Company & Job</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="pe-4 text-end">Offer Package</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReport.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4">
                        <div className="fw-bold">{item.student?.fullName}</div>
                        <div className="small text-muted">{item.student?.rollNumber}</div>
                      </td>
                      <td>{item.student?.department}</td>
                      <td>{item.student?.cgpa}</td>
                      <td>
                        <div className="fw-semibold">{item.job?.title}</div>
                        <div className="small text-muted">{item.job?.company?.companyName}</div>
                      </td>
                      <td className="small text-muted">{new Date(item.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="pe-4 text-end">
                        {item.offer ? (
                          <span className="badge bg-success-subtle text-success border">
                            {item.offer.ctc} LPA
                          </span>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENT BREAKDOWN */}
      {activeTab === 'departments' && (
        <div className="hub-card p-4">
          <h5 className="fw-bold mb-3">Department-wise Recruitment Performance</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Department</th>
                  <th>Total Enrolled</th>
                  <th>Placed Students</th>
                  <th>Unplaced</th>
                  <th>Placement Rate</th>
                  <th>Progress Bar</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.department}>
                    <td className="fw-bold">{d.department}</td>
                    <td>{d.totalStudents}</td>
                    <td className="text-success fw-bold">{d.placedStudents}</td>
                    <td className="text-muted">{d.totalStudents - d.placedStudents}</td>
                    <td className="fw-bold text-primary">{d.placementPercentage}%</td>
                    <td style={{ width: '200px' }}>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${d.placementPercentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMPANY SUMMARY */}
      {activeTab === 'companies' && (
        <div className="hub-card p-4">
          <h5 className="fw-bold mb-3">Recruiting Companies & Intake Summary</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Company</th>
                  <th>Sector</th>
                  <th>Positions Posted</th>
                  <th>Total Applicants</th>
                  <th>Hired Students</th>
                </tr>
              </thead>
              <tbody>
                {companySummary.map((c) => (
                  <tr key={c.companyId}>
                    <td className="fw-bold">{c.companyName}</td>
                    <td className="text-muted">{c.industry}</td>
                    <td>{c.totalJobs}</td>
                    <td>{c.totalApplications}</td>
                    <td>
                      <span className="badge bg-success-subtle text-success border px-2 py-1">
                        {c.hiredCount} Hired
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT REGISTRY */}
      {activeTab === 'students' && (
        <div className="hub-card p-4">
          <h5 className="fw-bold mb-3">Registered Students Registry ({students.length})</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Backlogs</th>
                  <th>Applications</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const isStudentHired = s.applications?.some(a => a.status === 'HIRED');
                  return (
                    <tr key={s.id}>
                      <td className="font-monospace fw-semibold">{s.rollNumber}</td>
                      <td className="fw-bold">{s.fullName}</td>
                      <td className="small text-muted">{s.user?.email}</td>
                      <td>{s.department}</td>
                      <td className="fw-semibold text-primary">{s.cgpa}</td>
                      <td>
                        <span className={s.activeBacklogs > 0 ? 'badge bg-danger-subtle text-danger' : 'badge bg-light text-dark'}>
                          {s.activeBacklogs}
                        </span>
                      </td>
                      <td>{s.applications?.length || 0}</td>
                      <td>
                        {isStudentHired ? (
                          <span className="badge bg-success">HIRED</span>
                        ) : (
                          <span className="badge bg-light text-secondary border">ACTIVE</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: GOVERNANCE & BUSINESS RULES */}
      {activeTab === 'rules' && (
        <div className="hub-card p-4">
          <h5 className="fw-bold mb-2">Provisional Placement Rules Architecture</h5>
          <p className="text-muted small mb-4">
            TalentHub encapsulates business logic in decoupled rule functions (<code className="text-dark">src/rules/</code>)
            configured in <code className="text-dark">src/config/appConfig.js</code>. Ready to be updated upon receiving the official faculty placement manual.
          </p>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-3 border rounded bg-light">
                <div className="badge bg-primary mb-1">RULE_NO_DUPLICATE_APPLICATIONS</div>
                <h6 className="fw-bold mb-1">Duplicate Application Prevention</h6>
                <p className="small text-secondary mb-0">
                  Prevents a student from submitting multiple applications for the exact same job listing.
                  Enforced at both service layer and SQLite database unique index level.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 border rounded bg-light">
                <div className="badge bg-primary mb-1">RULE_JOB_ACCEPTING_APPLICATIONS</div>
                <h6 className="fw-bold mb-1">Job Expiration & Status Check</h6>
                <p className="small text-secondary mb-0">
                  Enforces that applications can only be submitted to job listings that are OPEN and whose deadline has not elapsed.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 border rounded bg-light">
                <div className="badge bg-primary mb-1">RULE_STUDENT_ELIGIBILITY</div>
                <h6 className="fw-bold mb-1">Academic Criteria Evaluation</h6>
                <p className="small text-secondary mb-0">
                  Calculates if a candidate meets minimum CGPA, active backlogs threshold, and branch requirements.
                  Computes reasons for real-time visual badges.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 border rounded bg-light">
                <div className="badge bg-primary mb-1">RULE_APPLICATION_STATUS_TRANSITION</div>
                <h6 className="fw-bold mb-1">Centralized State Machine</h6>
                <p className="small text-secondary mb-0">
                  Guarantees that applications follow the verified 5-stage lifecycle (APPLIED → SHORTLISTED → INTERVIEW → OFFERED → HIRED/REJECTED) without arbitrary skips.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 border rounded bg-light">
                <div className="badge bg-primary mb-1">RULE_COMPANY_JOB_OWNERSHIP</div>
                <h6 className="fw-bold mb-1">Company Ownership Boundaries</h6>
                <p className="small text-secondary mb-0">
                  Restricts applicant actions, interview scheduling, and offer extensions strictly to the company that posted the job.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 border rounded bg-light">
                <div className="badge bg-primary mb-1">RULE_OFFER_ACCEPTANCE</div>
                <h6 className="fw-bold mb-1">Offer Resolution Governance</h6>
                <p className="small text-secondary mb-0">
                  Enforces that only the recipient candidate can accept or decline an offer before its deadline.
                  Handles one-offer college policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

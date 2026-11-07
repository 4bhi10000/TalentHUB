import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  Gift,
  PlusCircle,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Check,
  X,
  Send,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'createJob', 'applicants', 'interviews', 'offers', 'profile'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Data states
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);

  // Filter states for applicants
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [selectedAppForInterview, setSelectedAppForInterview] = useState(null);
  const [selectedAppForOffer, setSelectedAppForOffer] = useState(null);
  const [selectedInterviewForUpdate, setSelectedInterviewForUpdate] = useState(null);

  // Create Job Form
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    roleType: 'Full-time',
    packageCtc: '',
    location: '',
    minCgpa: 7.0,
    allowedDepartments: 'Computer Science,Information Science',
    maxBacklogs: 0,
    deadline: ''
  });

  // Schedule Interview Form
  const [interviewForm, setInterviewForm] = useState({
    roundName: 'Round 1: Technical Screening',
    scheduledDate: '',
    mode: 'ONLINE',
    venueOrLink: ''
  });

  // Issue Offer Form
  const [offerForm, setOfferForm] = useState({
    ctc: '',
    designation: '',
    joiningDate: '',
    deadline: '',
    remarks: ''
  });

  // Interview Result Update Form
  const [interviewUpdateForm, setInterviewUpdateForm] = useState({
    status: 'COMPLETED',
    result: 'CLEARED',
    feedback: ''
  });

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const [profRes, jobsRes, appsRes, intRes, offRes] = await Promise.all([
        api.get('/companies/profile'),
        api.get('/companies/jobs'),
        api.get('/companies/applicants'),
        api.get('/interviews/company'),
        api.get('/offers/company')
      ]);

      if (profRes.success) setProfile(profRes.data);
      if (jobsRes.success) setJobs(jobsRes.data);
      if (appsRes.success) setApplicants(appsRes.data);
      if (intRes.success) setInterviews(intRes.data);
      if (offRes.success) setOffers(offRes.data);
    } catch (err) {
      console.error('Failed to load company data:', err);
      setAlert({ type: 'danger', message: err.message || 'Error loading dashboard.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, []);

  // Handle Post Job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setAlert(null);

    try {
      const res = await api.post('/jobs', {
        ...jobForm,
        packageCtc: parseFloat(jobForm.packageCtc),
        minCgpa: parseFloat(jobForm.minCgpa),
        maxBacklogs: parseInt(jobForm.maxBacklogs, 10),
        deadline: new Date(jobForm.deadline).toISOString()
      });

      if (res.success) {
        setAlert({ type: 'success', message: `Job "${res.data.title}" posted successfully!` });
        setActiveTab('jobs');
        setJobForm({
          title: '',
          description: '',
          roleType: 'Full-time',
          packageCtc: '',
          location: '',
          minCgpa: 7.0,
          allowedDepartments: 'Computer Science,Information Science',
          maxBacklogs: 0,
          deadline: ''
        });
        await loadCompanyData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to post job.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Job Open/Closed Status
  const handleToggleJobStatus = async (jobId, currentStatus) => {
    setActionLoading(true);
    setAlert(null);
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';

    try {
      const res = await api.patch(`/jobs/${jobId}/status`, { status: newStatus });
      if (res.success) {
        setAlert({ type: 'success', message: `Job listing status changed to ${newStatus}.` });
        await loadCompanyData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to update job status.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Shortlist / Reject Applicant
  const handleUpdateStatus = async (appId, newStatus) => {
    setActionLoading(true);
    setAlert(null);

    try {
      const res = await api.patch(`/applications/${appId}/status`, {
        status: newStatus,
        remarks: `Updated to ${newStatus} by company recruiter.`
      });
      if (res.success) {
        setAlert({ type: 'success', message: `Applicant status updated to ${newStatus}.` });
        await loadCompanyData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to update applicant status.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Schedule Interview
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedAppForInterview) return;
    setActionLoading(true);
    setAlert(null);

    try {
      const res = await api.post('/interviews', {
        applicationId: selectedAppForInterview.id,
        roundName: interviewForm.roundName,
        scheduledDate: new Date(interviewForm.scheduledDate).toISOString(),
        mode: interviewForm.mode,
        venueOrLink: interviewForm.venueOrLink
      });

      if (res.success) {
        setAlert({ type: 'success', message: 'Interview scheduled successfully!' });
        setSelectedAppForInterview(null);
        await loadCompanyData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to schedule interview.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Update Interview Results
  const handleUpdateInterviewResult = async (e) => {
    e.preventDefault();
    if (!selectedInterviewForUpdate) return;
    setActionLoading(true);
    setAlert(null);

    try {
      const res = await api.patch(`/interviews/${selectedInterviewForUpdate.id}`, interviewUpdateForm);
      if (res.success) {
        setAlert({ type: 'success', message: 'Interview feedback & result recorded!' });
        setSelectedInterviewForUpdate(null);
        await loadCompanyData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to update interview result.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Issue Offer
  const handleIssueOffer = async (e) => {
    e.preventDefault();
    if (!selectedAppForOffer) return;
    setActionLoading(true);
    setAlert(null);

    try {
      const res = await api.post('/offers', {
        applicationId: selectedAppForOffer.id,
        ctc: parseFloat(offerForm.ctc),
        designation: offerForm.designation,
        joiningDate: offerForm.joiningDate ? new Date(offerForm.joiningDate).toISOString() : undefined,
        deadline: offerForm.deadline ? new Date(offerForm.deadline).toISOString() : undefined,
        remarks: offerForm.remarks
      });

      if (res.success) {
        setAlert({ type: 'success', message: `Job offer extended to candidate successfully!` });
        setSelectedAppForOffer(null);
        setOfferForm({ ctc: '', designation: '', joiningDate: '', deadline: '', remarks: '' });
        await loadCompanyData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to issue job offer.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-info" role="status"></div>
        <div className="mt-2 text-muted">Loading recruiter dashboard...</div>
      </div>
    );
  }

  const activeJobsCount = jobs.filter(j => j.status === 'OPEN').length;
  const filteredApplicants = statusFilter
    ? applicants.filter(a => a.status === statusFilter)
    : applicants;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="hub-card p-4 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="fw-bold mb-0">{profile?.companyName}</h3>
              <span className="badge bg-info-subtle text-info border px-2 py-1">
                Verified Recruiter
              </span>
            </div>
            <p className="text-muted small mb-0">
              Industry: <strong>{profile?.industry}</strong> | Location: <strong>{profile?.location || 'India'}</strong> | Contact:{' '}
              <strong>{profile?.contactEmail || user.email}</strong>
            </p>
          </div>

          <button
            onClick={() => setActiveTab('createJob')}
            className="btn btn-primary-hub d-flex align-items-center gap-2"
          >
            <PlusCircle size={18} />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show d-flex align-items-center gap-2`} role="alert">
          {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{alert.message}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {/* Metric Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-box">
            <div className="stat-icon bg-primary-subtle text-primary">
              <Briefcase size={24} />
            </div>
            <div>
              <div className="text-muted small">Active Listings</div>
              <div className="fs-4 fw-bold">{activeJobsCount} / {jobs.length}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-box">
            <div className="stat-icon bg-info-subtle text-info">
              <Users size={24} />
            </div>
            <div>
              <div className="text-muted small">Total Candidates</div>
              <div className="fs-4 fw-bold">{applicants.length}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-box">
            <div className="stat-icon bg-purple-subtle" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-muted small">Interviews</div>
              <div className="fs-4 fw-bold">{interviews.length}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-box">
            <div className="stat-icon bg-success-subtle text-success">
              <Gift size={24} />
            </div>
            <div>
              <div className="text-muted small">Offers Issued</div>
              <div className="fs-4 fw-bold">{offers.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <Briefcase size={16} />
            <span>Job Listings ({jobs.length})</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'applicants' ? 'active' : ''}`}
            onClick={() => setActiveTab('applicants')}
          >
            <Users size={16} />
            <span>Candidates Pipeline ({applicants.length})</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            <Calendar size={16} />
            <span>Interviews ({interviews.length})</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <Gift size={16} />
            <span>Job Offers ({offers.length})</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'createJob' ? 'active' : ''}`}
            onClick={() => setActiveTab('createJob')}
          >
            <PlusCircle size={16} />
            <span>Post Job</span>
          </button>
        </li>
      </ul>

      {/* TAB 1: MANAGE JOB LISTINGS */}
      {activeTab === 'jobs' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Your Posted JobListings</h5>
            <button onClick={() => setActiveTab('createJob')} className="btn btn-sm btn-primary-hub">
              + Add New Listing
            </button>
          </div>

          <div className="row g-4">
            {jobs.map((job) => (
              <div key={job.id} className="col-md-6">
                <div className="hub-card p-4 h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`badge ${job.status === 'OPEN' ? 'bg-success' : 'bg-secondary'}`}>
                      {job.status}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-secondary py-0"
                      onClick={() => handleToggleJobStatus(job.id, job.status)}
                    >
                      {job.status === 'OPEN' ? 'Close Listing' : 'Re-open Listing'}
                    </button>
                  </div>

                  <h5 className="fw-bold mb-1">{job.title}</h5>
                  <div className="small text-muted mb-3 d-flex flex-column gap-1">
                    <div className="d-flex align-items-center gap-2">
                      <DollarSign size={14} className="text-secondary" />
                      <span>{job.packageCtc ? `${job.packageCtc} LPA` : 'Not specified'}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <MapPin size={14} className="text-secondary" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Clock size={14} className="text-secondary" />
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="small text-secondary flex-grow-1" style={{ maxHeight: '60px', overflowY: 'auto' }}>
                    {job.description}
                  </p>

                  <div className="p-2 bg-light rounded small mb-3 border">
                    <div className="fw-bold text-muted" style={{ fontSize: '0.7rem' }}>ELIGIBILITY CONSTRAINTS:</div>
                    <div style={{ fontSize: '0.75rem' }}>
                      Min CGPA: <strong>{job.minCgpa}</strong> | Max Backlogs: <strong>{job.maxBacklogs}</strong>
                    </div>
                    <div className="text-truncate" style={{ fontSize: '0.72rem' }}>
                      Branches: <em>{job.allowedDepartments}</em>
                    </div>
                  </div>

                  <div className="border-top pt-2 d-flex justify-content-between align-items-center small text-muted">
                    <span>{job._count?.applications || 0} Total Applicants</span>
                    <button
                      onClick={() => {
                        setActiveTab('applicants');
                      }}
                      className="btn btn-sm btn-link p-0 text-decoration-none fw-semibold"
                    >
                      View Candidates →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATE APPLICANTS PIPELINE */}
      {activeTab === 'applicants' && (
        <div>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <h5 className="fw-bold mb-0">Candidate Recruitment Pipeline</h5>

            {/* Filter by Status */}
            <div className="d-flex align-items-center gap-2">
              <Filter size={16} className="text-muted" />
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '180px' }}
              >
                <option value="">All Statuses ({applicants.length})</option>
                <option value="APPLIED">Applied</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFERED">Offered</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {filteredApplicants.length === 0 ? (
            <div className="hub-card p-5 text-center text-muted">
              <Users size={36} className="mb-2 opacity-50" />
              <p>No candidate applications matching this criteria.</p>
            </div>
          ) : (
            <div className="hub-card overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Candidate</th>
                      <th>Job Position</th>
                      <th>Academic Profile</th>
                      <th>Applied Date</th>
                      <th>Current Status</th>
                      <th className="text-end pe-4">Recruitment Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map((app) => (
                      <tr key={app.id}>
                        <td className="ps-4">
                          <div className="fw-bold">{app.student?.fullName}</div>
                          <div className="text-muted small">
                            {app.student?.rollNumber} • {app.student?.user?.email}
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold">{app.job?.title}</div>
                          <div className="text-muted small">{app.job?.packageCtc} LPA</div>
                        </td>
                        <td>
                          <div>{app.student?.department}</div>
                          <div className="small text-muted">
                            CGPA: <strong className="text-primary">{app.student?.cgpa}</strong> | Backlogs:{' '}
                            <strong className={app.student?.activeBacklogs > 0 ? 'text-danger' : 'text-success'}>
                              {app.student?.activeBacklogs}
                            </strong>
                          </div>
                        </td>
                        <td className="small text-muted">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group btn-group-sm">
                            {/* Actions based on valid state transitions */}
                            {app.status === 'APPLIED' && (
                              <>
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                                  title="Shortlist Candidate"
                                >
                                  Shortlist
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                  title="Reject Candidate"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {app.status === 'SHORTLISTED' && (
                              <>
                                <button
                                  className="btn btn-primary-hub"
                                  onClick={() => {
                                    setSelectedAppForInterview(app);
                                    setInterviewForm({
                                      roundName: 'Round 1: Technical Interview',
                                      scheduledDate: '',
                                      mode: 'ONLINE',
                                      venueOrLink: ''
                                    });
                                  }}
                                >
                                  Schedule Interview
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {app.status === 'INTERVIEW' && (
                              <>
                                <button
                                  className="btn btn-warning text-dark fw-semibold"
                                  onClick={() => {
                                    setSelectedAppForOffer(app);
                                    setOfferForm({
                                      ctc: app.job?.packageCtc || '',
                                      designation: app.job?.title || '',
                                      joiningDate: '',
                                      deadline: '',
                                      remarks: ''
                                    });
                                  }}
                                >
                                  Extend Offer
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {app.status === 'OFFERED' && (
                              <span className="badge bg-warning text-dark">Awaiting Student Response</span>
                            )}

                            {app.status === 'HIRED' && (
                              <span className="badge bg-success">Candidate Hired 🎉</span>
                            )}

                            {app.status === 'REJECTED' && (
                              <span className="badge bg-secondary">Rejected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEDULED INTERVIEWS */}
      {activeTab === 'interviews' && (
        <div>
          <h5 className="fw-bold mb-3">Scheduled Interviews & Candidate Evaluations</h5>
          {interviews.length === 0 ? (
            <div className="hub-card p-5 text-center text-muted">
              <Calendar size={36} className="mb-2 opacity-50" />
              <p>No interviews currently scheduled.</p>
            </div>
          ) : (
            <div className="row g-3">
              {interviews.map((intv) => (
                <div key={intv.id} className="col-md-6">
                  <div className="hub-card p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-purple-subtle text-purple border" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                        {intv.roundName}
                      </span>
                      <span className={`badge ${intv.status === 'COMPLETED' ? 'bg-success' : 'bg-primary'}`}>
                        {intv.status}
                      </span>
                    </div>

                    <h5 className="fw-bold mb-1">{intv.application?.student?.fullName}</h5>
                    <div className="small text-muted mb-3">
                      Job: <strong>{intv.application?.job?.title}</strong> | Dept: {intv.application?.student?.department}
                    </div>

                    <div className="p-3 bg-light rounded small border mb-3">
                      <div><strong>Date:</strong> {new Date(intv.scheduledDate).toLocaleString()}</div>
                      <div><strong>Mode:</strong> {intv.mode}</div>
                      {intv.venueOrLink && (
                        <div>
                          <strong>Link / Venue:</strong>{' '}
                          {intv.venueOrLink.startsWith('http') ? (
                            <a href={intv.venueOrLink} target="_blank" rel="noreferrer" className="text-primary">
                              Meeting Link <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span>{intv.venueOrLink}</span>
                          )}
                        </div>
                      )}
                      {intv.result && (
                        <div className="mt-1">
                          <strong>Result:</strong>{' '}
                          <span className={`badge ${intv.result === 'CLEARED' ? 'bg-success' : 'bg-danger'}`}>
                            {intv.result}
                          </span>
                        </div>
                      )}
                    </div>

                    {intv.feedback && (
                      <div className="small text-muted mb-3">
                        <strong>Recruiter Feedback:</strong> {intv.feedback}
                      </div>
                    )}

                    <button
                      className="btn btn-sm btn-outline-primary w-100"
                      onClick={() => {
                        setSelectedInterviewForUpdate(intv);
                        setInterviewUpdateForm({
                          status: intv.status || 'COMPLETED',
                          result: intv.result || 'CLEARED',
                          feedback: intv.feedback || ''
                        });
                      }}
                    >
                      Record Interview Result & Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: JOB OFFERS */}
      {activeTab === 'offers' && (
        <div>
          <h5 className="fw-bold mb-3">Job Offers Extended</h5>
          {offers.length === 0 ? (
            <div className="hub-card p-5 text-center text-muted">
              <Gift size={36} className="mb-2 opacity-50" />
              <p>No job offers extended yet.</p>
            </div>
          ) : (
            <div className="row g-4">
              {offers.map((off) => (
                <div key={off.id} className="col-md-6">
                  <div className="hub-card p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-warning text-dark fw-bold">Official Offer</span>
                      <span className={`badge ${off.status === 'ACCEPTED' ? 'bg-success' : off.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {off.status}
                      </span>
                    </div>

                    <h5 className="fw-bold mb-1">{off.application?.student?.fullName}</h5>
                    <div className="text-muted small mb-3">Role: {off.designation}</div>

                    <div className="p-3 bg-light rounded small border mb-3">
                      <div><strong>Offered CTC:</strong> <span className="text-success fw-bold fs-6">{off.ctc} LPA</span></div>
                      {off.joiningDate && <div><strong>Joining:</strong> {new Date(off.joiningDate).toLocaleDateString()}</div>}
                      {off.deadline && <div><strong>Response Deadline:</strong> {new Date(off.deadline).toLocaleDateString()}</div>}
                    </div>

                    {off.remarks && (
                      <div className="small text-muted">
                        <strong>Note:</strong> {off.remarks}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: POST NEW JOB */}
      {activeTab === 'createJob' && (
        <div className="hub-card p-4" style={{ maxWidth: '760px' }}>
          <h5 className="fw-bold mb-2">Create & Publish Job Listing</h5>
          <p className="text-muted small mb-4">
            Specify academic criteria. The backend business rules engine verifies every student applicant against these thresholds.
          </p>

          <form onSubmit={handleCreateJob}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold">Job Title / Designation *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Graduate Software Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Employment Type</label>
                <select
                  className="form-select"
                  value={jobForm.roleType}
                  onChange={(e) => setJobForm({ ...jobForm, roleType: e.target.value })}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Intern + Full-time">Intern + Full-time</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Annual Package CTC (LPA) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  className="form-control"
                  placeholder="e.g. 14.5"
                  value={jobForm.packageCtc}
                  onChange={(e) => setJobForm({ ...jobForm, packageCtc: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Job Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Bangalore / Hybrid"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Application Deadline *</label>
                <input
                  type="date"
                  className="form-control"
                  value={jobForm.deadline}
                  onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold">Minimum CGPA Required *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-control"
                  value={jobForm.minCgpa}
                  onChange={(e) => setJobForm({ ...jobForm, minCgpa: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold">Maximum Allowed Backlogs *</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={jobForm.maxBacklogs}
                  onChange={(e) => setJobForm({ ...jobForm, maxBacklogs: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold">Allowed Departments *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Computer Science,Information Science"
                  value={jobForm.allowedDepartments}
                  onChange={(e) => setJobForm({ ...jobForm, allowedDepartments: e.target.value })}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Job Description & Requirements *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Outline responsibilities, required tech stack, and interview process..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  required
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-hub mt-4 d-flex align-items-center gap-2"
              disabled={actionLoading}
            >
              {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : <PlusCircle size={18} />}
              <span>Publish Job Listing</span>
            </button>
          </form>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {selectedAppForInterview && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content hub-card border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Schedule Interview Round</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAppForInterview(null)}
                ></button>
              </div>
              <form onSubmit={handleScheduleInterview}>
                <div className="modal-body py-3">
                  <div className="p-3 bg-light rounded border mb-3 small">
                    <div><strong>Candidate:</strong> {selectedAppForInterview.student?.fullName}</div>
                    <div><strong>Job:</strong> {selectedAppForInterview.job?.title}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Round Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={interviewForm.roundName}
                      onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Scheduled Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={interviewForm.scheduledDate}
                      onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Interview Mode</label>
                    <select
                      className="form-select"
                      value={interviewForm.mode}
                      onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                    >
                      <option value="ONLINE">ONLINE (Virtual Meeting)</option>
                      <option value="OFFLINE">OFFLINE (Campus / Office)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Meeting Link or Campus Venue</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://meet.google.com/xyz or Placement Hall 2"
                      value={interviewForm.venueOrLink}
                      onChange={(e) => setInterviewForm({ ...interviewForm, venueOrLink: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedAppForInterview(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-hub" disabled={actionLoading}>
                    {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Schedule Round'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EXTEND OFFER MODAL */}
      {selectedAppForOffer && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content hub-card border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Extend Job Offer</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAppForOffer(null)}
                ></button>
              </div>
              <form onSubmit={handleIssueOffer}>
                <div className="modal-body py-3">
                  <div className="p-3 bg-light rounded border mb-3 small">
                    <div><strong>Candidate:</strong> {selectedAppForOffer.student?.fullName}</div>
                    <div><strong>Job Listing:</strong> {selectedAppForOffer.job?.title}</div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Official Designation *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={offerForm.designation}
                        onChange={(e) => setOfferForm({ ...offerForm, designation: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Offered CTC (LPA) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={offerForm.ctc}
                        onChange={(e) => setOfferForm({ ...offerForm, ctc: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Expected Joining Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={offerForm.joiningDate}
                        onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Response Deadline</label>
                      <input
                        type="date"
                        className="form-control"
                        value={offerForm.deadline}
                        onChange={(e) => setOfferForm({ ...offerForm, deadline: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Offer Remarks / Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Congratulations! Welcome to our engineering cohort..."
                        value={offerForm.remarks}
                        onChange={(e) => setOfferForm({ ...offerForm, remarks: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedAppForOffer(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning text-dark fw-bold" disabled={actionLoading}>
                    {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Issue Official Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE INTERVIEW RESULT MODAL */}
      {selectedInterviewForUpdate && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content hub-card border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Record Interview Evaluation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedInterviewForUpdate(null)}
                ></button>
              </div>
              <form onSubmit={handleUpdateInterviewResult}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Round Status</label>
                    <select
                      className="form-select"
                      value={interviewUpdateForm.status}
                      onChange={(e) => setInterviewUpdateForm({ ...interviewUpdateForm, status: e.target.value })}
                    >
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Round Result</label>
                    <select
                      className="form-select"
                      value={interviewUpdateForm.result}
                      onChange={(e) => setInterviewUpdateForm({ ...interviewUpdateForm, result: e.target.value })}
                    >
                      <option value="CLEARED">CLEARED (Candidate Passed)</option>
                      <option value="FAILED">FAILED (Candidate Not Cleared)</option>
                      <option value="PENDING">PENDING (Under Evaluation)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Evaluation Feedback / Comments</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Technical strengths, communication skills, feedback..."
                      value={interviewUpdateForm.feedback}
                      onChange={(e) => setInterviewUpdateForm({ ...interviewUpdateForm, feedback: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedInterviewForUpdate(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-hub" disabled={actionLoading}>
                    {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Save Result'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

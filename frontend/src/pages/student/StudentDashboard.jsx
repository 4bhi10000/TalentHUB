import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import EligibilityBadge from '../../components/EligibilityBadge';
import ApplicationStepper from '../../components/ApplicationStepper';
import {
  Briefcase,
  FileText,
  Calendar,
  Gift,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  Building,
  MapPin,
  DollarSign,
  Send,
  ExternalLink,
  Award
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'applications', 'interviews', 'offers', 'profile'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'danger', message: '' }

  // Data states
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);

  // Apply Modal state
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [applyRemarks, setApplyRemarks] = useState('');

  // Offer Decision Modal state
  const [selectedOfferForDecision, setSelectedOfferForDecision] = useState(null);
  const [offerDecision, setOfferDecision] = useState('ACCEPTED');
  const [decisionRemarks, setDecisionRemarks] = useState('');

  // Profile Edit state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    department: '',
    cgpa: 0,
    activeBacklogs: 0,
    phone: '',
    resumeUrl: '',
    skills: ''
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profRes, jobsRes, appsRes, intRes, offRes] = await Promise.all([
        api.get('/students/profile'),
        api.get('/students/jobs'),
        api.get('/students/applications'),
        api.get('/interviews/student'),
        api.get('/offers/student')
      ]);

      if (profRes.success) {
        setProfile(profRes.data);
        setProfileForm({
          fullName: profRes.data.fullName || '',
          department: profRes.data.department || '',
          cgpa: profRes.data.cgpa || 0,
          activeBacklogs: profRes.data.activeBacklogs || 0,
          phone: profRes.data.phone || '',
          resumeUrl: profRes.data.resumeUrl || '',
          skills: profRes.data.skills || ''
        });
      }
      if (jobsRes.success) setJobs(jobsRes.data);
      if (appsRes.success) setApplications(appsRes.data);
      if (intRes.success) setInterviews(intRes.data);
      if (offRes.success) setOffers(offRes.data);
    } catch (err) {
      console.error('Failed to load student data:', err);
      setAlert({ type: 'danger', message: err.message || 'Error loading dashboard data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle Application Submit
  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedJobForApply) return;
    setActionLoading(true);
    setAlert(null);

    try {
      const res = await api.post('/applications/apply', {
        jobId: selectedJobForApply.id,
        remarks: applyRemarks
      });
      if (res.success) {
        setAlert({
          type: 'success',
          message: `Application for "${selectedJobForApply.title}" submitted successfully!`
        });
        setSelectedJobForApply(null);
        setApplyRemarks('');
        await loadAllData();
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.message || 'Application failed to submit.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Offer Response
  const handleOfferResponse = async (e) => {
    e.preventDefault();
    if (!selectedOfferForDecision) return;
    setActionLoading(true);
    setAlert(null);

    try {
      const res = await api.patch(`/offers/${selectedOfferForDecision.id}/respond`, {
        decision: offerDecision,
        remarks: decisionRemarks
      });
      if (res.success) {
        setAlert({
          type: 'success',
          message: `Offer ${offerDecision.toLowerCase()} recorded successfully!`
        });
        setSelectedOfferForDecision(null);
        setDecisionRemarks('');
        await loadAllData();
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.message || 'Failed to submit offer response.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setAlert(null);

    try {
      const res = await api.put('/students/profile', {
        fullName: profileForm.fullName,
        department: profileForm.department,
        cgpa: parseFloat(profileForm.cgpa),
        activeBacklogs: parseInt(profileForm.activeBacklogs, 10),
        phone: profileForm.phone,
        resumeUrl: profileForm.resumeUrl,
        skills: profileForm.skills
      });
      if (res.success) {
        setAlert({ type: 'success', message: 'Profile updated successfully!' });
        await loadAllData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to update profile.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Loading your student portal...</div>
      </div>
    );
  }

  // Summary Metrics
  const totalApplied = applications.length;
  const totalInterviews = interviews.length;
  const pendingOffers = offers.filter(o => o.status === 'PENDING').length;
  const isHired = applications.some(a => a.status === 'HIRED');

  return (
    <div className="container py-4">
      {/* Student Welcome Header */}
      <div className="hub-card p-4 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="fw-bold mb-0">Welcome, {profile?.fullName || user.email}!</h3>
              {isHired && (
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">
                  🎉 Placed & Hired
                </span>
              )}
            </div>
            <p className="text-muted small mb-0">
              Roll No: <strong className="text-dark">{profile?.rollNumber}</strong> | Department:{' '}
              <strong className="text-dark">{profile?.department}</strong> | CGPA:{' '}
              <strong className="text-primary">{profile?.cgpa?.toFixed(2)}</strong> | Backlogs:{' '}
              <strong className={profile?.activeBacklogs > 0 ? 'text-danger' : 'text-success'}>
                {profile?.activeBacklogs}
              </strong>
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="btn btn-sm btn-outline-hub d-flex align-items-center gap-1"
            >
              <User size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
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
              <div className="text-muted small">Available Jobs</div>
              <div className="fs-4 fw-bold">{jobs.length}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-box">
            <div className="stat-icon bg-info-subtle text-info">
              <FileText size={24} />
            </div>
            <div>
              <div className="text-muted small">My Applications</div>
              <div className="fs-4 fw-bold">{totalApplied}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-box">
            <div className="stat-icon bg-purple-subtle text-purple" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-muted small">Interviews</div>
              <div className="fs-4 fw-bold">{totalInterviews}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-box">
            <div className="stat-icon bg-warning-subtle text-warning">
              <Gift size={24} />
            </div>
            <div>
              <div className="text-muted small">Job Offers</div>
              <div className="fs-4 fw-bold">
                {offers.length} {pendingOffers > 0 && <span className="badge bg-warning text-dark ms-1">{pendingOffers} Action Required</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <Briefcase size={16} />
            <span>Job Opportunities</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <FileText size={16} />
            <span>My Applications ({applications.length})</span>
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
            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            <span>Academic Profile</span>
          </button>
        </li>
      </ul>

      {/* TAB 1: AVAILABLE JOBS */}
      {activeTab === 'jobs' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Open Job Opportunities</h5>
            <span className="small text-muted">Eligibility calculated according to college placement policy</span>
          </div>

          <div className="row g-4">
            {jobs.map((job) => {
              const isEligible = job.eligibility?.isEligible;
              const hasApplied = job.hasApplied;

              return (
                <div key={job.id} className="col-md-6 col-lg-4">
                  <div className="hub-card p-4 h-100 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <EligibilityBadge eligibility={job.eligibility} />
                      {hasApplied && <StatusBadge status={job.applicationStatus} />}
                    </div>

                    <h5 className="fw-bold text-dark mt-2 mb-1">{job.title}</h5>
                    <div className="d-flex align-items-center gap-1 text-primary fw-semibold small mb-2">
                      <Building size={14} />
                      <span>{job.company?.companyName}</span>
                    </div>

                    <div className="small text-muted mb-3 d-flex flex-column gap-1">
                      <div className="d-flex align-items-center gap-2">
                        <DollarSign size={14} className="text-secondary" />
                        <span>Package: <strong>{job.packageCtc ? `${job.packageCtc} LPA` : 'Best in Industry'}</strong></span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <MapPin size={14} className="text-secondary" />
                        <span>{job.location || 'Pan India'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={14} className="text-secondary" />
                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="small text-secondary flex-grow-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                      {job.description}
                    </p>

                    <div className="p-2 bg-light rounded small mb-3 border">
                      <div className="fw-semibold text-muted" style={{ fontSize: '0.7rem' }}>CRITERIA:</div>
                      <div style={{ fontSize: '0.75rem' }}>
                        Min CGPA: <strong>{job.minCgpa}</strong> | Max Backlogs: <strong>{job.maxBacklogs}</strong>
                      </div>
                      <div className="text-truncate" style={{ fontSize: '0.72rem' }}>
                        Eligible Branches: <em>{job.allowedDepartments}</em>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {hasApplied ? (
                        <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                          Already Applied
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary-hub btn-sm w-100"
                          disabled={!isEligible}
                          onClick={() => setSelectedJobForApply(job)}
                        >
                          {isEligible ? 'Apply Now' : 'Not Eligible'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div>
          <h5 className="fw-bold mb-3">Application Pipeline & Tracking</h5>
          {applications.length === 0 ? (
            <div className="hub-card p-5 text-center text-muted">
              <Briefcase size={36} className="mb-2 opacity-50" />
              <p>You have not applied for any jobs yet.</p>
              <button onClick={() => setActiveTab('jobs')} className="btn btn-sm btn-primary-hub">
                Explore Available Jobs
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {applications.map((app) => (
                <div key={app.id} className="col-12">
                  <div className="hub-card p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">{app.job?.title}</h5>
                        <div className="text-muted small">
                          {app.job?.company?.companyName} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-end">
                        <StatusBadge status={app.status} />
                        {app.job?.packageCtc && (
                          <div className="small fw-bold text-success mt-1">{app.job.packageCtc} LPA</div>
                        )}
                      </div>
                    </div>

                    {/* Step-by-step visual tracker */}
                    <ApplicationStepper currentStatus={app.status} />

                    {app.remarks && (
                      <div className="mt-3 p-2 bg-light rounded small text-secondary border">
                        <strong>Status Note:</strong> {app.remarks}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEDULED INTERVIEWS */}
      {activeTab === 'interviews' && (
        <div>
          <h5 className="fw-bold mb-3">Scheduled Interview Rounds</h5>
          {interviews.length === 0 ? (
            <div className="hub-card p-5 text-center text-muted">
              <Calendar size={36} className="mb-2 opacity-50" />
              <p>No interview rounds scheduled yet.</p>
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
                      <span className={`badge ${intv.status === 'SCHEDULED' ? 'bg-primary' : 'bg-secondary'}`}>
                        {intv.status}
                      </span>
                    </div>

                    <h5 className="fw-bold mb-1">{intv.application?.job?.title}</h5>
                    <div className="text-muted small mb-3">{intv.application?.job?.company?.companyName}</div>

                    <div className="p-3 bg-light rounded small border mb-3">
                      <div className="mb-1">
                        <strong>Date & Time:</strong> {new Date(intv.scheduledDate).toLocaleString()}
                      </div>
                      <div className="mb-1">
                        <strong>Mode:</strong> {intv.mode}
                      </div>
                      {intv.venueOrLink && (
                        <div>
                          <strong>Link / Venue:</strong>{' '}
                          {intv.venueOrLink.startsWith('http') ? (
                            <a href={intv.venueOrLink} target="_blank" rel="noreferrer" className="text-primary text-decoration-none">
                              Join Meeting <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span>{intv.venueOrLink}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {intv.feedback && (
                      <div className="small text-muted">
                        <strong>Feedback:</strong> {intv.feedback}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: JOB OFFERS & DECISION */}
      {activeTab === 'offers' && (
        <div>
          <h5 className="fw-bold mb-3">Placement Job Offers</h5>
          {offers.length === 0 ? (
            <div className="hub-card p-5 text-center text-muted">
              <Gift size={36} className="mb-2 opacity-50" />
              <p>No job offers extended yet.</p>
            </div>
          ) : (
            <div className="row g-4">
              {offers.map((off) => (
                <div key={off.id} className="col-md-6">
                  <div className="hub-card p-4 border-2 border-warning-subtle">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className="badge bg-warning text-dark fw-bold mb-1">Official Offer</span>
                        <h4 className="fw-bold mb-0 text-dark">{off.designation}</h4>
                        <div className="text-primary fw-semibold">{off.application?.job?.company?.companyName}</div>
                      </div>
                      <span className={`badge ${off.status === 'ACCEPTED' ? 'bg-success' : off.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {off.status}
                      </span>
                    </div>

                    <div className="p-3 bg-light rounded border mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">Package Offered:</span>
                        <strong className="text-success fs-5">{off.ctc} LPA</strong>
                      </div>
                      {off.joiningDate && (
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted small">Expected Joining:</span>
                          <strong>{new Date(off.joiningDate).toLocaleDateString()}</strong>
                        </div>
                      )}
                      {off.deadline && (
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted small">Response Deadline:</span>
                          <strong className="text-danger">{new Date(off.deadline).toLocaleDateString()}</strong>
                        </div>
                      )}
                    </div>

                    {off.remarks && (
                      <div className="small text-muted mb-3">
                        <strong>Company Note:</strong> {off.remarks}
                      </div>
                    )}

                    {off.status === 'PENDING' ? (
                      <button
                        className="btn btn-primary-hub w-100"
                        onClick={() => setSelectedOfferForDecision(off)}
                      >
                        Accept / Reject Offer
                      </button>
                    ) : (
                      <div className="text-center small py-2 fw-semibold text-muted bg-light rounded">
                        Offer response recorded: {off.status}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE MANAGEMENT */}
      {activeTab === 'profile' && (
        <div className="hub-card p-4" style={{ maxWidth: '720px' }}>
          <h5 className="fw-bold mb-3">Academic & Personal Profile</h5>
          <p className="text-muted small mb-4">
            Your CGPA and active backlogs are automatically referenced by the system's eligibility rules engine.
          </p>

          <form onSubmit={handleProfileUpdate}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Roll Number / USN</label>
                <input type="text" className="form-control" value={profile?.rollNumber || ''} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Department / Branch</label>
                <select
                  className="form-select"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Science">Information Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold">Current CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-control"
                  value={profileForm.cgpa}
                  onChange={(e) => setProfileForm({ ...profileForm, cgpa: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold">Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={profileForm.activeBacklogs}
                  onChange={(e) => setProfileForm({ ...profileForm, activeBacklogs: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Contact Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Resume Link (URL)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://drive.google.com/..."
                  value={profileForm.resumeUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, resumeUrl: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Key Skills</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-hub mt-4 d-flex align-items-center gap-2"
              disabled={actionLoading}
            >
              {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* APPLY MODAL */}
      {selectedJobForApply && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content hub-card border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Apply for {selectedJobForApply.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedJobForApply(null)}
                ></button>
              </div>
              <form onSubmit={handleApply}>
                <div className="modal-body py-3">
                  <div className="p-3 bg-light rounded border mb-3 small">
                    <div><strong>Company:</strong> {selectedJobForApply.company?.companyName}</div>
                    <div><strong>Package:</strong> {selectedJobForApply.packageCtc} LPA</div>
                    <div><strong>Your CGPA:</strong> {profile?.cgpa} (Minimum: {selectedJobForApply.minCgpa})</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Application Remarks / Statement (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Why are you a great match for this position?"
                      value={applyRemarks}
                      onChange={(e) => setApplyRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedJobForApply(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary-hub d-flex align-items-center gap-2"
                    disabled={actionLoading}
                  >
                    {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : <Send size={16} />}
                    <span>Confirm Application</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* OFFER DECISION MODAL */}
      {selectedOfferForDecision && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content hub-card border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Offer Response: {selectedOfferForDecision.designation}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOfferForDecision(null)}
                ></button>
              </div>
              <form onSubmit={handleOfferResponse}>
                <div className="modal-body py-3">
                  <div className="p-3 bg-warning-subtle rounded border mb-3 small text-dark">
                    <strong>Package:</strong> {selectedOfferForDecision.ctc} LPA
                    <div className="mt-1">
                      <em>Institutional note: Accepting an offer marks you as HIRED in the college placement cell.</em>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Your Official Decision</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="decisionRadio"
                          id="acceptRadio"
                          value="ACCEPTED"
                          checked={offerDecision === 'ACCEPTED'}
                          onChange={() => setOfferDecision('ACCEPTED')}
                        />
                        <label className="form-check-label fw-bold text-success" htmlFor="acceptRadio">
                          Accept Offer
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="decisionRadio"
                          id="rejectRadio"
                          value="REJECTED"
                          checked={offerDecision === 'REJECTED'}
                          onChange={() => setOfferDecision('REJECTED')}
                        />
                        <label className="form-check-label fw-bold text-danger" htmlFor="rejectRadio">
                          Decline / Reject Offer
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Remarks (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Add an acceptance note or feedback..."
                      value={decisionRemarks}
                      onChange={(e) => setDecisionRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedOfferForDecision(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${offerDecision === 'ACCEPTED' ? 'btn-success' : 'btn-danger'}`}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : `Submit ${offerDecision}`}
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

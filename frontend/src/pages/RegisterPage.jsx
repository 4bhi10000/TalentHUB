import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Building2, UserPlus, AlertCircle, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [roleTab, setRoleTab] = useState('STUDENT'); // STUDENT or COMPANY
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerStudent, registerCompany } = useAuth();
  const navigate = useNavigate();

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    email: '',
    password: '',
    fullName: '',
    rollNumber: '',
    department: 'Computer Science',
    cgpa: '',
    graduationYear: 2026,
    activeBacklogs: 0,
    phone: '',
    skills: ''
  });

  // Company Form State
  const [companyForm, setCompanyForm] = useState({
    email: '',
    password: '',
    companyName: '',
    industry: '',
    website: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    location: ''
  });

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerStudent({
        ...studentForm,
        cgpa: parseFloat(studentForm.cgpa),
        graduationYear: parseInt(studentForm.graduationYear, 10),
        activeBacklogs: parseInt(studentForm.activeBacklogs || '0', 10)
      });
      navigate('/student');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerCompany(companyForm);
      navigate('/company');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '640px' }}>
      <div className="text-center mb-4">
        <div className="brand-badge mb-2 d-inline-flex">
          <Sparkles size={18} />
          <span>TalentHub Registration</span>
        </div>
        <h3 className="fw-bold mt-2">Create your campus account</h3>
        <p className="text-muted small">
          Public registration is available for Students and Corporate Recruiters.
          Coordinator accounts are governed by the administrative placement cell.
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="d-flex p-1 bg-light rounded-pill border mb-4">
        <button
          type="button"
          className={`btn w-50 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
            roleTab === 'STUDENT' ? 'btn-primary-hub shadow-sm' : 'btn-light border-0'
          }`}
          onClick={() => {
            setRoleTab('STUDENT');
            setError('');
          }}
        >
          <GraduationCap size={18} />
          <span>Student Account</span>
        </button>

        <button
          type="button"
          className={`btn w-50 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
            roleTab === 'COMPANY' ? 'btn-primary-hub shadow-sm' : 'btn-light border-0'
          }`}
          onClick={() => {
            setRoleTab('COMPANY');
            setError('');
          }}
        >
          <Building2 size={18} />
          <span>Company / Recruiter</span>
        </button>
      </div>

      <div className="hub-card p-4">
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" role="alert">
            <AlertCircle size={18} className="flex-shrink-0" />
            <div className="small">{error}</div>
          </div>
        )}

        {roleTab === 'STUDENT' ? (
          <form onSubmit={handleStudentSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Roll Number / USN *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CS2023001"
                  value={studentForm.rollNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">College Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. rahul@student.edu"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Department / Branch *</label>
                <select
                  className="form-select"
                  value={studentForm.department}
                  onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                  required
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Science">Information Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold">Current CGPA *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-control"
                  placeholder="8.50"
                  value={studentForm.cgpa}
                  onChange={(e) => setStudentForm({ ...studentForm, cgpa: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold">Backlogs *</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="0"
                  value={studentForm.activeBacklogs}
                  onChange={(e) => setStudentForm({ ...studentForm, activeBacklogs: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Graduation Year</label>
                <input
                  type="number"
                  className="form-control"
                  value={studentForm.graduationYear}
                  onChange={(e) => setStudentForm({ ...studentForm, graduationYear: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Key Skills</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. React, Node.js, Python, SQL"
                  value={studentForm.skills}
                  onChange={(e) => setStudentForm({ ...studentForm, skills: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-hub w-100 py-2 mt-4 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Register as Student</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCompanySubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Acme Tech Solutions"
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Industry Sector *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Enterprise Software, Cloud"
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Corporate Work Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="recruiter@acme.com"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={companyForm.password}
                  onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Website URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://acme.com"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Headquarters / Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Bangalore, India"
                  value={companyForm.location}
                  onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold">Company Overview / Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Brief overview of the company, mission, and recruitment expectations..."
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-hub w-100 py-2 mt-4 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Register Company Account</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-4 pt-3 border-top small text-muted">
          Already registered?{' '}
          <Link to="/login" className="text-primary fw-bold text-decoration-none">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

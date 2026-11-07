import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, AlertCircle, ArrowRight, Check } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'STUDENT') navigate('/student');
      else if (user.role === 'COMPANY') navigate('/company');
      else if (user.role === 'COORDINATOR') navigate('/coordinator');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="container py-5" style={{ maxWidth: '520px' }}>
      <div className="text-center mb-4">
        <div className="brand-badge mb-2 d-inline-flex">
          <Sparkles size={18} />
          <span>TalentHub</span>
        </div>
        <h3 className="fw-bold mt-2">Sign in to your portal</h3>
        <p className="text-muted small">Select your role or enter your institutional credentials</p>
      </div>

      {/* Quick Demo Credentials Autofill Pill Bar */}
      <div className="hub-card p-3 mb-4 bg-light">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>
            Quick Demo Autofill
          </span>
          <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.65rem' }}>
            1-Click Test
          </span>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-warning text-dark flex-grow-1"
            onClick={() => autofill('coordinator@talenthub.edu', 'Coordinator@123')}
          >
            Coordinator
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-info text-dark flex-grow-1"
            onClick={() => autofill('recruiter@google.com', 'Company@123')}
          >
            Google Company
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary flex-grow-1"
            onClick={() => autofill('rahul@student.edu', 'Student@123')}
          >
            Rahul (Student)
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-success flex-grow-1"
            onClick={() => autofill('priya@student.edu', 'Student@123')}
          >
            Priya (Student)
          </button>
        </div>
      </div>

      <div className="hub-card p-4">
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
            <AlertCircle size={18} className="flex-shrink-0" />
            <div className="small">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. rahul@student.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary-hub w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top small text-muted">
          Need an account?{' '}
          <Link to="/register" className="text-primary fw-bold text-decoration-none">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

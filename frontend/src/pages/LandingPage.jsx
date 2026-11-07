import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Award,
  Users
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student';
    if (user.role === 'COMPANY') return '/company';
    if (user.role === 'COORDINATOR') return '/coordinator';
    return '/login';
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-center">
        <div className="container py-4">
          <div className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-bold mb-3">
            Official Campus Placement Portal 2026
          </div>
          <h1 className="display-4 fw-extrabold text-slate-900 mb-3" style={{ fontWeight: 800 }}>
            TalentHub: Centralized Campus Placement & Hiring
          </h1>
          <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '720px' }}>
            A unified, transparent platform connecting students, recruiting companies, and placement coordinators.
            Driven by automated academic eligibility verification and robust business rule governance.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {isAuthenticated ? (
              <Link to={getDashboardLink()} className="btn btn-primary-hub btn-lg d-flex align-items-center gap-2">
                <span>Go to Your Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary-hub btn-lg d-flex align-items-center gap-2">
                  <span>Sign In to Portal</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn btn-outline-hub btn-lg">
                  New Registration
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Role Architecture Overview */}
      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Three Primary Stakeholder Portals</h2>
          <p className="text-muted">Designed specifically for our campus recruitment ecosystem</p>
        </div>

        <div className="row g-4">
          {/* Student Portal */}
          <div className="col-md-4">
            <div className="hub-card p-4 h-100 d-flex flex-column">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="stat-icon bg-primary-subtle text-primary">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h4 className="fw-bold mb-0">STUDENT</h4>
                  <small className="text-muted">Academic & Job Journey</small>
                </div>
              </div>
              <ul className="list-unstyled text-secondary small flex-grow-1">
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Real-time job eligibility check (CGPA & branch)
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  One-click application with duplicate prevention
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Visual 5-stage application status tracking
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Official offer letters & online acceptance
                </li>
              </ul>
              <Link to="/login" className="btn btn-outline-primary btn-sm w-100 mt-3">
                Student Sign In
              </Link>
            </div>
          </div>

          {/* Company Portal */}
          <div className="col-md-4">
            <div className="hub-card p-4 h-100 d-flex flex-column">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="stat-icon bg-info-subtle text-info">
                  <Building2 size={28} />
                </div>
                <div>
                  <h4 className="fw-bold mb-0">COMPANY</h4>
                  <small className="text-muted">Recruitment & Pipeline</small>
                </div>
              </div>
              <ul className="list-unstyled text-secondary small flex-grow-1">
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Post jobs with custom CGPA & branch criteria
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Review verified student profiles & resumes
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Schedule multi-round interviews with links
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Issue verified job offers with CTC & joining date
                </li>
              </ul>
              <Link to="/login" className="btn btn-outline-info btn-sm w-100 mt-3">
                Company Sign In
              </Link>
            </div>
          </div>

          {/* Coordinator Portal */}
          <div className="col-md-4">
            <div className="hub-card p-4 h-100 d-flex flex-column">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="stat-icon bg-warning-subtle text-warning">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="fw-bold mb-0">COORDINATOR</h4>
                  <small className="text-muted">Placement Cell Governance</small>
                </div>
              </div>
              <ul className="list-unstyled text-secondary small flex-grow-1">
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Placement percentage & aggregate KPIs
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Department-wise recruitment analytics
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Comprehensive applications audit report
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Complete institutional placement registry
                </li>
              </ul>
              <Link to="/login" className="btn btn-outline-warning btn-sm w-100 mt-3">
                Coordinator Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Fast-Access Card */}
      <section className="bg-light border-top border-bottom py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="fw-bold">Evaluator & Demo Credentials</h3>
            <p className="text-muted">
              Pre-seeded institutional accounts for evaluation and testing. Click any role on the login page to autofill.
            </p>
          </div>

          <div className="row g-3 justify-content-center">
            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0">
                <div className="fw-bold text-primary mb-1">Coordinator (Placement Cell)</div>
                <div className="small text-muted mb-2">coordinator@talenthub.edu</div>
                <div className="badge bg-light text-dark border align-self-start font-monospace">
                  Coordinator@123
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0">
                <div className="fw-bold text-info mb-1">Company (Google Cloud)</div>
                <div className="small text-muted mb-2">recruiter@google.com</div>
                <div className="badge bg-light text-dark border align-self-start font-monospace">
                  Company@123
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0">
                <div className="fw-bold text-success mb-1">Student (Rahul Sharma - CSE)</div>
                <div className="small text-muted mb-2">rahul@student.edu</div>
                <div className="badge bg-light text-dark border align-self-start font-monospace">
                  Student@123
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

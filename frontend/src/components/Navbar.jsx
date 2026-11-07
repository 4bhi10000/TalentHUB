import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Building2, Shield, LogOut, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student';
    if (user.role === 'COMPANY') return '/company';
    if (user.role === 'COORDINATOR') return '/coordinator';
    return '/';
  };

  const getRoleIcon = () => {
    if (user?.role === 'STUDENT') return <GraduationCap size={15} />;
    if (user?.role === 'COMPANY') return <Building2 size={15} />;
    if (user?.role === 'COORDINATOR') return <Shield size={15} />;
    return <User size={15} />;
  };

  return (
    <nav className="custom-navbar sticky-top">
      <div className="container-fluid d-flex align-items-center justify-content-between px-md-4">
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <div className="brand-badge">
            <Sparkles size={18} />
            <span>TalentHub</span>
          </div>
          <span className="d-none d-sm-inline text-muted fs-7 fw-semibold ms-2 border-start ps-3 py-1">
            Campus Placement System
          </span>
        </Link>

        <div className="d-flex align-items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className="btn btn-sm btn-outline-hub d-flex align-items-center gap-2">
                {getRoleIcon()}
                <span>Dashboard</span>
              </Link>

              <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill border">
                <span className="badge bg-primary text-uppercase" style={{ fontSize: '0.65rem' }}>
                  {user.role}
                </span>
                <span className="small fw-semibold text-secondary d-none d-md-inline">
                  {user.profile?.fullName || user.profile?.companyName || user.email}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-sm btn-light text-danger d-flex align-items-center gap-1 border"
                title="Logout"
              >
                <LogOut size={16} />
                <span className="d-none d-md-inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-sm btn-outline-hub">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary-hub">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

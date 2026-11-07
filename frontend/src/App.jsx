import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
    if (user.role === 'COMPANY') return <Navigate to="/company" replace />;
    if (user.role === 'COORDINATOR') return <Navigate to="/coordinator" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />

          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student Portal */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Company Portal */}
              <Route
                path="/company"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY']}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Coordinator Portal */}
              <Route
                path="/coordinator"
                element={
                  <ProtectedRoute allowedRoles={['COORDINATOR']}>
                    <CoordinatorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="bg-white border-top py-4 text-center text-muted small mt-auto">
            <div className="container">
              <div className="fw-semibold text-dark mb-1">TalentHub Campus Placement Management System</div>
              <div>Designed with decoupled business rule architecture for university placements.</div>
              <div className="mt-2 text-secondary" style={{ fontSize: '0.75rem' }}>
                Antigravity Enterprise Engineering • Academic Placement Cell 2026
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

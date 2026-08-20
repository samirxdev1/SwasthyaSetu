import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UnifiedLogin from '../pages/auth/UnifiedLogin';
import PublicLabReportView from '../pages/public/PublicLabReportView';
import DoctorRoutes from './DoctorRoutes';
import LabRoutes from './LabRoutes';
import ProtectedRoute from '../components/common/ProtectedRoute';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';

// Wrapper for public login route to redirect logged-in users straight to their dashboard
function LoginRedirectWrapper() {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message="Restoring security context..." />;
  }

  if (isAuthenticated) {
    if (role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    if (role === 'laboratory') {
      return <Navigate to="/laboratory/dashboard" replace />;
    }
  }

  return <UnifiedLogin />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Unified Login Route */}
      <Route path="/" element={<LoginRedirectWrapper />} />
      
      {/* Public Shareable Lab Report Route (No Auth Required) */}
      <Route path="/public/lab-reports/:shareToken" element={<PublicLabReportView />} />

      {/* Protected Doctor Workstation Routes */}
      <Route 
        path="/doctor/* text" 
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorRoutes />
          </ProtectedRoute>
        } 
      />

      {/* Standard Doctor Routes */}
      <Route 
        path="/doctor/*" 
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorRoutes />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Laboratory Station Routes */}
      <Route 
        path="/laboratory/*" 
        element={
          <ProtectedRoute allowedRoles={['laboratory']}>
            <LabRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/lab/*" 
        element={<Navigate to="/laboratory/dashboard" replace />} 
      />
      
      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UnifiedLogin from '../pages/auth/UnifiedLogin';
import DoctorRoutes from './DoctorRoutes';
import LabDashboard from '../pages/laboratory/LabDashboard';
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
      return <Navigate to="/lab/dashboard" replace />;
    }
  }

  return <UnifiedLogin />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Unified Login Route */}
      <Route path="/" element={<LoginRedirectWrapper />} />
      
      {/* Protected Doctor Workstation Routes */}
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
        path="/lab/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['laboratory']}>
            <LabDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/laboratory/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['laboratory']}>
            <LabDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

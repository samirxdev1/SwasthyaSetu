import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, isLoading } = useAuth();

  // If session is rehydrating, show telemetry loader
  if (isLoading) {
    return <Loader message="Verifying clinical security clearances..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const normalizedRole = (role || '').toLowerCase();
  const normalizedAllowedRoles = (allowedRoles || []).map(r => r.toLowerCase());

  // If authenticated but role is not allowed, redirect to respective dashboard
  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(normalizedRole)) {
    if (normalizedRole === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    if (normalizedRole === 'laboratory') {
      return <Navigate to="/laboratory/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Render children or nested routes
  return children ? children : <Outlet />;
}

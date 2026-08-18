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

  // If authenticated but role is not allowed, redirect to respective dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    if (role === 'laboratory') {
      return <Navigate to="/lab/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Render children or nested routes
  return children ? children : <Outlet />;
}

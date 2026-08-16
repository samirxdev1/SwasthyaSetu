import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UnifiedLogin from '../pages/auth/UnifiedLogin';
import DoctorRoutes from './DoctorRoutes';
import LabDashboard from '../pages/laboratory/LabDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<UnifiedLogin />} />
      <Route path="/doctor/*" element={<DoctorRoutes />} />
      <Route path="/lab/dashboard" element={<LabDashboard />} />
      <Route path="/laboratory/dashboard" element={<LabDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

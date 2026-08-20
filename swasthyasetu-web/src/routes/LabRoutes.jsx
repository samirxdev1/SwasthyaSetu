import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LabProvider } from '../context/LabContext';
import LabLayout from '../layouts/LabLayout';
import LabDashboard from '../pages/laboratory/LabDashboard';
import PendingOrdersPage from '../pages/laboratory/PendingOrdersPage';
import ReportUploadPage from '../pages/laboratory/ReportUploadPage';
import ReportHistoryPage from '../pages/laboratory/ReportHistoryPage';
import LabNotificationsPage from '../pages/laboratory/LabNotificationsPage';
import LabProfilePage from '../pages/laboratory/LabProfilePage';

/**
 * LabRoutes — React Router sub-routes for Diagnostic Laboratory Workstation.
 * Employs LabLayout as persistent shell with Outlet sub-route rendering.
 */
export default function LabRoutes() {
  return (
    <LabProvider>
      <Routes>
        <Route element={<LabLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LabDashboard />} />
          <Route path="orders" element={<PendingOrdersPage />} />
          <Route path="upload" element={<ReportUploadPage />} />
          <Route path="reports" element={<ReportHistoryPage />} />
          <Route path="notifications" element={<LabNotificationsPage />} />
          <Route path="profile" element={<LabProfilePage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </LabProvider>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DoctorProvider } from '../context/DoctorContext';
import DoctorLayout from '../layouts/DoctorLayout';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import PatientRecordView from '../pages/doctor/PatientRecordView';
import ConsultationPage from '../pages/doctor/ConsultationPage';
import LabOrderPage from '../pages/doctor/LabOrderPage';
import DoctorNotificationsPage from '../pages/doctor/DoctorNotificationsPage';
import DoctorProfilePage from '../pages/doctor/DoctorProfilePage';

/**
 * DoctorRoutes — React Router routes configuration for Doctor Workstation.
 * Employs DoctorLayout as persistent shell with Outlet sub-route rendering.
 */
export default function DoctorRoutes() {
  return (
    <DoctorProvider>
      <Routes>
        <Route element={<DoctorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<PatientRecordView />} />
          <Route path="search" element={<Navigate to="/doctor/patients" replace />} />
          <Route path="consultations" element={<ConsultationPage />} />
          <Route path="lab-orders" element={<LabOrderPage />} />
          <Route path="notifications" element={<DoctorNotificationsPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </DoctorProvider>
  );
}

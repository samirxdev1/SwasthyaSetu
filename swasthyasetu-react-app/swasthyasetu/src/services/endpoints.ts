import { apiGet, apiPost, ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  health_id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  address: string;
  emergency_contact: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_date: string;
  symptoms: string;
  doctor_notes: string;
  probable_diagnosis: string | null;
  confirmed_diagnosis: string | null;
  status: 'ongoing' | 'awaiting_report' | 'completed';
  created_at: string;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  created_at: string;
}

export interface LabOrder {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  laboratory_id: string | null;
  test_name: string;
  status: 'pending' | 'in_progress' | 'completed';
  ordered_at: string;
  updated_at: string;
}

export interface LabReport {
  id: string;
  lab_order_id: string;
  report_file_url: string;
  report_summary: string;
  uploaded_at: string;
}

export interface ChronicCondition {
  id: string;
  patient_id: string;
  condition_name: string;
  diagnosed_date: string;
  status: string;
  notes: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface ScannedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

export interface ScanPrescriptionResult {
  medicines: ScannedMedicine[];
  explanation: string;
  disclaimer: string;
}

export const authApi = {
  login: (identifier: string, password: string) =>
    apiPost<{ user: User; role: string; profile: any; token: string }>('/auth/login', {
      identifier,
      password,
    }),
  me: () =>
    apiGet<{ user: User; profile: PatientProfile }>('/auth/me'),
};

export const patientApi = {
  getProfile: () => apiGet<PatientProfile>('/patients/me'),
  getConsultations: () => apiGet<Consultation[]>('/patients/me/consultations'),
  getPrescriptions: () => apiGet<Prescription[]>('/patients/me/prescriptions'),
  getLabOrders: () => apiGet<LabOrder[]>('/patients/me/lab-orders'),
  getLabReports: () => apiGet<LabReport[]>('/patients/me/lab-reports'),
  getChronicConditions: () => apiGet<ChronicCondition[]>('/patients/me/chronic-conditions'),
};

export const notificationsApi = {
  getAll: () => apiGet<Notification[]>('/notifications'),
  markRead: (id: string) => apiPatch<Notification>(`/notifications/${id}/read`),
};

export const aiApi = {
  scanPrescription: (formData: FormData): Promise<ApiResponse<ScanPrescriptionResult>> =>
    apiPost('/ai/scan-prescription', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),
  chat: (message: string) =>
    apiPost<{ reply: string }>('/ai/chat', { message }, { timeout: 120000 }),
};

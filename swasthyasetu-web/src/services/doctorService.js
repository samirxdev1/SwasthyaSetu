import api from './api';

/**
 * Helper function to unwrap response.data.data or throw clean Error(message).
 */
async function handleRequest(requestPromise) {
  try {
    const response = await requestPromise;
    return response.data?.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const err = new Error(message);
    err.status = error.response?.status;
    err.response = error.response;
    throw err;
  }
}

export const searchPatientByHealthId = async (healthId) => {
  return handleRequest(api.get('/patients/search', { params: { health_id: healthId } }));
};

export const createConsultation = async (data) => {
  return handleRequest(api.post('/consultations', data));
};

export const getConsultationsForPatient = async (patientId) => {
  return handleRequest(api.get(`/consultations/patient/${patientId}`));
};

export const updateConsultation = async (id, data) => {
  return handleRequest(api.patch(`/consultations/${id}`, data));
};

export const createPrescription = async (data) => {
  return handleRequest(api.post('/prescriptions', data));
};

export const getPrescriptionsForConsultation = async (consultationId) => {
  return handleRequest(api.get(`/prescriptions/consultation/${consultationId}`));
};

export const createLabOrder = async (data) => {
  return handleRequest(api.post('/lab-orders', data));
};

export const getLabOrdersForPatient = async (patientId) => {
  return handleRequest(api.get(`/lab-orders/patient/${patientId}`));
};

export const createChronicCondition = async (data) => {
  return handleRequest(api.post('/chronic-conditions', data));
};

export const getChronicConditionsForPatient = async (patientId) => {
  return handleRequest(api.get(`/chronic-conditions/patient/${patientId}`));
};

export const checkDrugInteraction = async (prescriptionId) => {
  return handleRequest(api.post('/ai/check-interaction', { prescription_id: prescriptionId }));
};

export const acknowledgeInteractionFlag = async (flagId) => {
  return handleRequest(api.patch(`/drug-interaction-flags/${flagId}/acknowledge`));
};

export const getLabReportByOrderId = async (labOrderId) => {
  return handleRequest(api.get(`/lab-reports/order/${labOrderId}`));
};

export const getNotifications = async () => {
  return handleRequest(api.get('/notifications'));
};

export const markNotificationRead = async (notificationId) => {
  return handleRequest(api.patch(`/notifications/${notificationId}/read`));
};

const doctorService = {
  searchPatientByHealthId,
  createConsultation,
  getConsultationsForPatient,
  updateConsultation,
  createPrescription,
  getPrescriptionsForConsultation,
  createLabOrder,
  getLabOrdersForPatient,
  createChronicCondition,
  getChronicConditionsForPatient,
  checkDrugInteraction,
  acknowledgeInteractionFlag,
  getLabReportByOrderId,
  getNotifications,
  markNotificationRead,
};

export default doctorService;

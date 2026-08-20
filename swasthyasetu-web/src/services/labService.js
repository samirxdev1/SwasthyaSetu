import api from './api';

/**
 * Extract clean human-readable error message from Axios response/error
 */
const extractErrorMessage = (error, defaultMsg) => {
  if (error.response && error.response.data) {
    if (error.response.data.message) {
      return error.response.data.message;
    }
    if (Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
      return error.response.data.errors.map(e => e.msg || e.message).join(', ');
    }
  }
  return error.message || defaultMsg;
};

const labService = {
  /**
   * Retrieves all unassigned pending lab orders across the system
   * GET /api/lab-orders/pending
   */
  async getPendingLabOrders() {
    try {
      const response = await api.get('/lab-orders/pending');
      return response.data?.data || [];
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch pending lab orders'));
    }
  },

  /**
   * Assigns a pending unassigned lab order to the requesting laboratory
   * PATCH /api/lab-orders/:id/accept
   */
  async acceptLabOrder(orderId) {
    try {
      const response = await api.patch(`/lab-orders/${orderId}/accept`);
      return response.data?.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to accept lab order'));
    }
  },

  /**
   * Retrieves all lab orders assigned to the requesting laboratory
   * GET /api/lab-orders/laboratory
   */
  async getMyLabOrderQueue() {
    try {
      const response = await api.get('/lab-orders/laboratory');
      return response.data?.data || [];
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch laboratory order queue'));
    }
  },

  /**
   * Uploads a lab report file (PDF/image) via multipart/form-data
   * POST /api/lab-reports
   * @param {FormData} formData - Must contain lab_order_id, file, and optional report_summary
   */
  async uploadLabReport(formData) {
    try {
      const response = await api.post('/lab-reports', formData);
      return response.data?.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to upload lab report'));
    }
  },

  /**
   * Retrieves uploaded lab report details for a specific lab order
   * GET /api/lab-reports/order/:labOrderId
   */
  async getLabReportByOrderId(labOrderId) {
    try {
      const response = await api.get(`/lab-reports/order/${labOrderId}`);
      return response.data?.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch lab report details'));
    }
  },

  /**
   * Retrieves public lab report details by share token (No auth required)
   * GET /api/lab-reports/public/:shareToken
   */
  async getPublicLabReport(shareToken) {
    try {
      const response = await api.get(`/lab-reports/public/${shareToken}`);
      return response.data?.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to load public lab report'));
    }
  },
};

export default labService;


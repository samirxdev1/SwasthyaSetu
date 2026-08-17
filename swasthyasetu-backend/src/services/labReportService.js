import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';
import { randomUUID } from 'crypto';
import labOrderService from './labOrderService.js';
import storageService from './storageService.js';
import authService from './authService.js';
import consultationService from './consultationService.js';

const memoryLabReports = [];

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

export const getLabReportByOrderId = async (labOrderId) => {
  let report = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('lab_order_id', labOrderId)
        .single();

      if (!error && data) report = data;
    } catch (err) {
      console.warn('Supabase get lab report failed:', err.message);
    }
  }

  if (!report) {
    report = memoryLabReports.find(r => r.lab_order_id === labOrderId);
  }

  return report;
};

export const createLabReport = async (userId, file, bodyData) => {
  const { lab_order_id, report_summary } = bodyData;

  if (!lab_order_id) {
    const error = new Error('lab_order_id is required');
    error.statusCode = 400;
    throw error;
  }

  if (!file) {
    const error = new Error('Report file is required (PDF or Image format)');
    error.statusCode = 400;
    throw error;
  }

  const labProfile = await labOrderService.getLabProfileByUserId(userId);
  const labId = labProfile.id;

  const labOrder = await labOrderService.getLabOrderById(lab_order_id);
  if (!labOrder) {
    const error = new Error(`Lab order with ID '${lab_order_id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  if (labOrder.laboratory_id !== labId) {
    const error = new Error('Forbidden. You are not authorized to upload reports for this lab order.');
    error.statusCode = 403;
    throw error;
  }

  // Check if a report already exists for this lab_order_id
  const existingReport = await getLabReportByOrderId(lab_order_id);
  if (existingReport) {
    const error = new Error('Conflict. A lab report has already been uploaded for this lab order.');
    error.statusCode = 409;
    throw error;
  }

  // Upload file via Storage Service
  const report_file_url = await storageService.uploadReportFile(
    file.buffer,
    file.originalname,
    file.mimetype
  );

  const now = new Date().toISOString();
  const newReport = {
    id: randomUUID(),
    lab_order_id,
    report_file_url,
    report_summary: report_summary || null,
    uploaded_at: now
  };

  let createdReport = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('lab_reports')
        .insert([newReport])
        .select()
        .single();

      if (!error && data) createdReport = data;
    } catch (err) {
      console.warn('Supabase insert lab report failed, using memory store:', err.message);
    }
  }

  if (!createdReport) {
    memoryLabReports.push(newReport);
    createdReport = newReport;
  }

  // Update lab_orders status to 'completed'
  if (!isPlaceholderConfig() && supabase) {
    try {
      await supabase
        .from('lab_orders')
        .update({ status: 'completed', updated_at: now })
        .eq('id', lab_order_id);
    } catch (err) {
      console.warn('Failed to update lab order status to completed:', err.message);
    }
  }

  labOrder.status = 'completed';
  labOrder.updated_at = now;

  return createdReport;
};

export const getReportForLabOrder = async (userId, labOrderId) => {
  if (!labOrderId) {
    const error = new Error('labOrderId parameter is required');
    error.statusCode = 400;
    throw error;
  }

  const labOrder = await labOrderService.getLabOrderById(labOrderId);
  if (!labOrder) {
    const error = new Error(`Lab order with ID '${labOrderId}' not found`);
    error.statusCode = 404;
    throw error;
  }

  // Verify authorization based on user profile
  const userProfile = await authService.getUserProfile(userId);
  const role = userProfile.user.role;
  const profileId = userProfile.profile?.id;

  let isAuthorized = false;
  if (role === 'doctor' && labOrder.doctor_id === profileId) {
    isAuthorized = true;
  } else if (role === 'laboratory' && labOrder.laboratory_id === profileId) {
    isAuthorized = true;
  } else if (role === 'patient' && labOrder.patient_id === profileId) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    const error = new Error('Forbidden. You are not authorized to view this lab report.');
    error.statusCode = 403;
    throw error;
  }

  const report = await getLabReportByOrderId(labOrderId);
  if (!report) {
    const error = new Error(`No report found for lab order ID '${labOrderId}'`);
    error.statusCode = 404;
    throw error;
  }

  return report;
};

export default {
  createLabReport,
  getReportForLabOrder,
  getLabReportByOrderId
};

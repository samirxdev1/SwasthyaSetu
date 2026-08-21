import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';
import { randomUUID } from 'crypto';
import labOrderService from './labOrderService.js';
import storageService from './storageService.js';
import authService from './authService.js';
import notificationService from './notificationService.js';
import { STORAGE_BUCKETS } from '../constants/storageBuckets.js';

const memoryLabReports = [];

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

/**
 * Resolves a lab report's stored report_file_url (storage path) to a fresh signed URL
 * and attaches share token and share URL.
 * @param {Object} report - Lab report object
 * @returns {Promise<Object>} Cloned report object with report_file_url set to signed URL and share_url
 */
export const resolveReportSignedUrl = async (report) => {
  if (!report) return report;
  
  // Ensure report has a share_token
  const shareToken = report.share_token || report.id;
  const clientBaseUrl = config.CLIENT_URL || 'http://localhost:5173';
  const shareUrl = `${clientBaseUrl}/public/lab-reports/${shareToken}`;

  let signedUrl = report.report_file_url;
  if (report.report_file_url) {
    signedUrl = await storageService.getSignedUrl(STORAGE_BUCKETS.LAB_REPORTS, report.report_file_url);
  }

  return {
    ...report,
    share_token: shareToken,
    share_url: shareUrl,
    report_file_url: signedUrl
  };
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

export const getLabReportByShareToken = async (shareToken) => {
  if (!shareToken) {
    const error = new Error('shareToken parameter is required');
    error.statusCode = 400;
    throw error;
  }

  let report = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      if (!error && data) report = data;
    } catch (err) {
      console.warn('Supabase get lab report by share_token failed:', err.message);
    }
  }

  if (!report) {
    report = memoryLabReports.find(r => r.share_token === shareToken || r.id === shareToken);
  }

  if (!report) {
    const error = new Error(`Lab report with share token '${shareToken}' not found`);
    error.statusCode = 404;
    throw error;
  }

  // Get associated lab order info for context
  let orderInfo = null;
  try {
    const labOrder = await labOrderService.getLabOrderById(report.lab_order_id);
    if (labOrder) {
      orderInfo = {
        id: labOrder.id,
        test_names: labOrder.test_names || labOrder.test_name || 'Diagnostic Lab Test',
        status: labOrder.status,
        created_at: labOrder.created_at,
        urgency: labOrder.urgency
      };
    }
  } catch (e) {
    console.warn('Could not fetch lab order info for public report:', e.message);
  }

  const resolvedReport = await resolveReportSignedUrl(report);

  return {
    report: resolvedReport,
    order: orderInfo
  };
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

  // Construct storage path: reports/<patientId_or_orderId>/<timestamp>-<sanitized_name>
  const sanitizedFileName = file.originalname ? file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_') : 'report.pdf';
  const folder = labOrder.patient_id || lab_order_id;
  const storagePath = `reports/${folder}/${Date.now()}-${sanitizedFileName}`;

  // Upload file buffer to private Supabase Storage bucket 'lab-reports'
  const report_file_url = await storageService.uploadFile(
    STORAGE_BUCKETS.LAB_REPORTS,
    storagePath,
    file.buffer,
    file.mimetype
  );

  const now = new Date().toISOString();
  const share_token = randomUUID();
  const newReport = {
    id: randomUUID(),
    lab_order_id,
    report_file_url, // Permanent storage path
    report_summary: report_summary || null,
    share_token,
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
      if (error) console.warn('Supabase insert lab report error:', error.message);
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

  // Send notification to ordering doctor and patient
  try {
    const testTitle = labOrder.test_names || labOrder.test_name || 'Lab Test';

    // Enrich patient name details if available
    let patientName = labOrder.patient_name || 'Patient';
    let patientHealthId = labOrder.patient_health_id || '';
    if (!patientHealthId && labOrder.patient_id) {
      if (!isPlaceholderConfig() && supabase) {
        const { data: pData } = await supabase.from('patients').select('full_name, health_id').eq('id', labOrder.patient_id).single();
        if (pData) {
          patientName = pData.full_name || patientName;
          patientHealthId = pData.health_id || patientHealthId;
        }
      }
    }
    const patientStr = patientHealthId ? `${patientName} (${patientHealthId})` : patientName;

    // Find Doctor's user_id for notification target
    let doctorUserId = null;
    if (labOrder.doctor_id) {
      if (!isPlaceholderConfig() && supabase) {
        const { data: dData } = await supabase.from('doctors').select('user_id').eq('id', labOrder.doctor_id).single();
        if (dData) doctorUserId = dData.user_id;
      }
      if (!doctorUserId) {
        const memD = (authService.memoryDoctors || []).find(d => d.id === labOrder.doctor_id || d.user_id === labOrder.doctor_id);
        if (memD) doctorUserId = memD.user_id || memD.id;
      }
    }

    if (doctorUserId) {
      await notificationService.createNotification(
        doctorUserId,
        `Lab Report Ready: ${testTitle}`,
        `Diagnostic report for ${patientStr} — ${testTitle} — has been uploaded by the laboratory and is ready for review.`,
        'report_ready'
      );
    }
  } catch (notifErr) {
    console.warn('Failed to send lab report ready notification to doctor:', notifErr.message);
  }

  // Return report object with fresh signed URL and share_url for client consumption
  return await resolveReportSignedUrl(createdReport);
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

  // Return report with fresh signed URL
  return await resolveReportSignedUrl(report);
};

export default {
  createLabReport,
  getReportForLabOrder,
  getLabReportByOrderId,
  getLabReportByShareToken,
  resolveReportSignedUrl
};



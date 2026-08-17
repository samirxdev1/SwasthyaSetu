import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';
import { randomUUID } from 'crypto';
import consultationService from './consultationService.js';
import authService from './authService.js';

const memoryLabOrders = [];

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

export const getLabProfileByUserId = async (userId) => {
  const profileRes = await authService.getUserProfile(userId);
  if (!profileRes || !profileRes.profile) {
    const error = new Error('Laboratory profile not found for this user');
    error.statusCode = 404;
    throw error;
  }
  return profileRes.profile;
};

export const getLabOrderById = async (id) => {
  let labOrder = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('lab_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) labOrder = data;
    } catch (err) {
      console.warn('Supabase get lab order by ID failed:', err.message);
    }
  }

  if (!labOrder) {
    labOrder = memoryLabOrders.find(o => o.id === id);
  }

  return labOrder;
};

export const createLabOrder = async (userId, orderData) => {
  const { consultation_id, patient_id, test_name } = orderData;

  if (!consultation_id || !patient_id || !test_name) {
    const error = new Error('consultation_id, patient_id, and test_name are required');
    error.statusCode = 400;
    throw error;
  }

  const doctorProfile = await consultationService.getDoctorProfileByUserId(userId);
  const doctorId = doctorProfile.id;

  const consultation = await consultationService.getConsultationById(consultation_id);
  if (!consultation) {
    const error = new Error(`Consultation with ID '${consultation_id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  if (consultation.doctor_id !== doctorId) {
    const error = new Error('Forbidden. You are not authorized to create lab orders for this consultation.');
    error.statusCode = 403;
    throw error;
  }

  const now = new Date().toISOString();
  const newOrder = {
    id: randomUUID(),
    consultation_id,
    patient_id,
    doctor_id: doctorId,
    laboratory_id: null,
    test_name,
    status: 'pending',
    ordered_at: now,
    updated_at: now
  };

  let createdOrder = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('lab_orders')
        .insert([newOrder])
        .select()
        .single();

      if (!error && data) createdOrder = data;
    } catch (err) {
      console.warn('Supabase create lab order failed, using memory store:', err.message);
    }
  }

  if (!createdOrder) {
    memoryLabOrders.push(newOrder);
    createdOrder = newOrder;
  }

  // Update linked consultation status to 'awaiting_report'
  try {
    await consultationService.updateConsultation(consultation_id, userId, { status: 'awaiting_report' });
  } catch (err) {
    console.warn('Failed to update consultation status to awaiting_report:', err.message);
  }

  return createdOrder;
};

export const getPendingLabOrders = async () => {
  let pendingOrders = [];

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('lab_orders')
        .select('*')
        .eq('status', 'pending')
        .is('laboratory_id', null);

      if (!error && data) pendingOrders = data;
    } catch (err) {
      console.warn('Supabase get pending lab orders failed, using memory store:', err.message);
    }
  }

  if (pendingOrders.length === 0) {
    pendingOrders = memoryLabOrders.filter(o => o.status === 'pending' && !o.laboratory_id);
  }

  return pendingOrders;
};

export const acceptLabOrder = async (id, userId) => {
  const labProfile = await getLabProfileByUserId(userId);
  const labId = labProfile.id;

  const labOrder = await getLabOrderById(id);
  if (!labOrder) {
    const error = new Error(`Lab order with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  if (labOrder.laboratory_id !== null || labOrder.status !== 'pending') {
    const error = new Error('Conflict. This lab order has already been assigned to a laboratory or is no longer pending.');
    error.statusCode = 409;
    throw error;
  }

  const now = new Date().toISOString();
  const updateFields = {
    laboratory_id: labId,
    status: 'in_progress',
    updated_at: now
  };

  let updatedOrder = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('lab_orders')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) updatedOrder = data;
    } catch (err) {
      console.warn('Supabase accept lab order failed, using memory store:', err.message);
    }
  }

  if (!updatedOrder) {
    Object.assign(labOrder, updateFields);
    updatedOrder = { ...labOrder };
  }

  return updatedOrder;
};

export const getLaboratoryLabOrders = async (userId) => {
  const labProfile = await getLabProfileByUserId(userId);
  const labId = labProfile.id;

  let labOrders = [];

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('lab_orders')
        .select('*')
        .eq('laboratory_id', labId)
        .order('ordered_at', { ascending: false });

      if (!error && data) labOrders = data;
    } catch (err) {
      console.warn('Supabase get lab orders by laboratory failed, using memory store:', err.message);
    }
  }

  if (labOrders.length === 0) {
    labOrders = memoryLabOrders
      .filter(o => o.laboratory_id === labId)
      .sort((a, b) => new Date(b.ordered_at) - new Date(a.ordered_at));
  }

  return labOrders;
};

export const getPatientLabOrders = async (patientId) => {
  if (!patientId) {
    const error = new Error('patientId is required');
    error.statusCode = 400;
    throw error;
  }

  let labOrders = [];

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('lab_orders')
        .select('*')
        .eq('patient_id', patientId);

      if (!error && data) labOrders = data;
    } catch (err) {
      console.warn('Supabase get patient lab orders failed, using memory store:', err.message);
    }
  }

  if (labOrders.length === 0) {
    labOrders = memoryLabOrders.filter(o => o.patient_id === patientId);
  }

  return labOrders;
};

export default {
  getLabProfileByUserId,
  getLabOrderById,
  createLabOrder,
  getPendingLabOrders,
  acceptLabOrder,
  getLaboratoryLabOrders,
  getPatientLabOrders
};

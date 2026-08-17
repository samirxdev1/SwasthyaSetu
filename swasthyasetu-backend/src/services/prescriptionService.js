import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';
import { randomUUID } from 'crypto';
import consultationService from './consultationService.js';

const memoryPrescriptions = [];

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

export const createPrescription = async (userId, prescriptionData) => {
  const { consultation_id, medicine_name, dosage, frequency, duration, instructions } = prescriptionData;

  if (!consultation_id || !medicine_name || !dosage) {
    const error = new Error('consultation_id, medicine_name, and dosage are required');
    error.statusCode = 400;
    throw error;
  }

  // Look up consultation to verify authorization
  const consultation = await consultationService.getConsultationById(consultation_id);
  if (!consultation) {
    const error = new Error(`Consultation with ID '${consultation_id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  // Get requesting doctor's profile ID
  const doctorProfile = await consultationService.getDoctorProfileByUserId(userId);
  if (consultation.doctor_id !== doctorProfile.id) {
    const error = new Error('Forbidden. You are not authorized to create prescriptions for this consultation.');
    error.statusCode = 403;
    throw error;
  }

  const now = new Date().toISOString();
  const newPrescription = {
    id: randomUUID(),
    consultation_id,
    medicine_name,
    dosage,
    frequency: frequency || null,
    duration: duration || null,
    instructions: instructions || null,
    created_at: now
  };

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([newPrescription])
        .select()
        .single();

      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase create prescription failed, using memory store:', err.message);
    }
  }

  memoryPrescriptions.push(newPrescription);
  return newPrescription;
};

export const getPrescriptionsByConsultationId = async (consultationId) => {
  if (!consultationId) {
    const error = new Error('consultationId is required');
    error.statusCode = 400;
    throw error;
  }

  let prescriptions = [];

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('consultation_id', consultationId);

      if (!error && data) prescriptions = data;
    } catch (err) {
      console.warn('Supabase get prescriptions failed, using memory store:', err.message);
    }
  }

  if (prescriptions.length === 0) {
    prescriptions = memoryPrescriptions.filter(p => p.consultation_id === consultationId);
  }

  return prescriptions;
};

export default {
  createPrescription,
  getPrescriptionsByConsultationId
};

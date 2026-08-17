import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';
import { randomUUID } from 'crypto';
import authService from './authService.js';

const memoryConsultations = [];

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

// Helper to resolve doctor profile (and doctors.id) from user_id (users.id)
export const getDoctorProfileByUserId = async (userId) => {
  const profileRes = await authService.getUserProfile(userId);
  if (!profileRes || !profileRes.profile) {
    const error = new Error('Doctor profile not found for this user');
    error.statusCode = 404;
    throw error;
  }
  return profileRes.profile;
};

export const createConsultation = async (userId, consultationData) => {
  const doctorProfile = await getDoctorProfileByUserId(userId);
  const doctorId = doctorProfile.id;

  const { patient_id, symptoms, doctor_notes, probable_diagnosis } = consultationData;

  if (!patient_id) {
    const error = new Error('patient_id is required');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const newConsultation = {
    id: randomUUID(),
    patient_id,
    doctor_id: doctorId,
    consultation_date: now,
    symptoms: symptoms || null,
    doctor_notes: doctor_notes || null,
    probable_diagnosis: probable_diagnosis || null,
    confirmed_diagnosis: null,
    status: 'ongoing',
    created_at: now
  };

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert([newConsultation])
        .select()
        .single();

      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase create consultation failed, using memory store:', err.message);
    }
  }

  memoryConsultations.push(newConsultation);
  return newConsultation;
};

export const getConsultationsByPatientId = async (patientId) => {
  if (!patientId) {
    const error = new Error('patientId is required');
    error.statusCode = 400;
    throw error;
  }

  let consultations = [];

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('consultation_date', { ascending: false });

      if (!error && data) consultations = data;
    } catch (err) {
      console.warn('Supabase get consultations failed, using memory store:', err.message);
    }
  }

  if (consultations.length === 0) {
    consultations = memoryConsultations
      .filter(c => c.patient_id === patientId)
      .sort((a, b) => new Date(b.consultation_date) - new Date(a.consultation_date));
  }

  return consultations;
};

export const getConsultationById = async (id) => {
  let consultation = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) consultation = data;
    } catch (err) {
      console.warn('Supabase get consultation by ID failed:', err.message);
    }
  }

  if (!consultation) {
    consultation = memoryConsultations.find(c => c.id === id);
  }

  return consultation;
};

export const updateConsultation = async (id, userId, updateData) => {
  const doctorProfile = await getDoctorProfileByUserId(userId);
  const doctorId = doctorProfile.id;

  const consultation = await getConsultationById(id);

  if (!consultation) {
    const error = new Error(`Consultation with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: doctor must own this consultation
  if (consultation.doctor_id !== doctorId) {
    const error = new Error('Forbidden. You are not authorized to update this consultation.');
    error.statusCode = 403;
    throw error;
  }

  const { doctor_notes, probable_diagnosis, confirmed_diagnosis, status } = updateData;

  // Status transition validation
  if (status) {
    const validStatuses = ['ongoing', 'awaiting_report', 'completed'];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Invalid status value. Allowed values are: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    // Rule 1: Cannot jump from 'ongoing' directly to 'completed' without doctor_notes or a diagnosis
    if (consultation.status === 'ongoing' && status === 'completed') {
      const effectiveNotes = doctor_notes !== undefined ? doctor_notes : consultation.doctor_notes;
      const effectiveProbable = probable_diagnosis !== undefined ? probable_diagnosis : consultation.probable_diagnosis;
      const effectiveConfirmed = confirmed_diagnosis !== undefined ? confirmed_diagnosis : consultation.confirmed_diagnosis;

      if (!effectiveNotes && !effectiveProbable && !effectiveConfirmed) {
        const error = new Error("Illogical status transition: Cannot complete consultation without doctor notes or a diagnosis present.");
        error.statusCode = 400;
        throw error;
      }
    }

    // Rule 2: Cannot revert from 'completed' to 'ongoing'
    if (consultation.status === 'completed' && status === 'ongoing') {
      const error = new Error("Illogical status transition: Completed consultations cannot be reverted to ongoing status.");
      error.statusCode = 400;
      throw error;
    }
  }

  const fieldsToUpdate = {};
  if (doctor_notes !== undefined) fieldsToUpdate.doctor_notes = doctor_notes;
  if (probable_diagnosis !== undefined) fieldsToUpdate.probable_diagnosis = probable_diagnosis;
  if (confirmed_diagnosis !== undefined) fieldsToUpdate.confirmed_diagnosis = confirmed_diagnosis;
  if (status !== undefined) fieldsToUpdate.status = status;

  let updatedConsultation = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .update(fieldsToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) updatedConsultation = data;
    } catch (err) {
      console.warn('Supabase update consultation failed, using memory store:', err.message);
    }
  }

  if (!updatedConsultation) {
    Object.assign(consultation, fieldsToUpdate);
    updatedConsultation = { ...consultation };
  }

  return updatedConsultation;
};

export default {
  getDoctorProfileByUserId,
  createConsultation,
  getConsultationsByPatientId,
  getConsultationById,
  updateConsultation
};

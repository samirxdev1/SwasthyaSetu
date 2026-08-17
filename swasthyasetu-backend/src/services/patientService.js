import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';
import { randomUUID } from 'crypto';
import authService from './authService.js';

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

export const searchPatientByHealthId = async (healthId) => {
  if (!healthId) {
    const error = new Error('Health ID query parameter is required');
    error.statusCode = 400;
    throw error;
  }

  let patient = null;
  let chronicConditions = [];

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data: patientDb, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('health_id', healthId)
        .single();

      if (!patientError && patientDb) {
        patient = patientDb;

        const { data: conditionsDb } = await supabase
          .from('chronic_conditions')
          .select('*')
          .eq('patient_id', patient.id);

        chronicConditions = conditionsDb || [];
      }
    } catch (dbErr) {
      console.warn('Supabase patient search failed, using memory store fallback:', dbErr.message);
    }
  }

  if (!patient) {
    patient = authService.memoryPatients.find(p => p.health_id === healthId);
    if (patient) {
      chronicConditions = authService.memoryChronicConditions.filter(c => c.patient_id === patient.id);
    }
  }

  if (!patient) {
    const error = new Error(`Patient with health_id '${healthId}' not found`);
    error.statusCode = 404;
    throw error;
  }

  return {
    ...patient,
    chronic_conditions: chronicConditions
  };
};

export const createPatientHelper = async (patientData) => {
  const newPatient = {
    id: patientData.id || randomUUID(),
    user_id: patientData.user_id || randomUUID(),
    health_id: patientData.health_id,
    full_name: patientData.full_name,
    date_of_birth: patientData.date_of_birth,
    gender: patientData.gender || 'Male',
    blood_group: patientData.blood_group || 'O+',
    address: patientData.address || '123 Test St',
    emergency_contact: patientData.emergency_contact || '+919999988888',
    created_at: new Date().toISOString()
  };

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase.from('patients').insert([newPatient]).select().single();
      if (!error && data) {
        if (patientData.chronic_conditions) {
          for (const cond of patientData.chronic_conditions) {
            const condObj = { id: randomUUID(), patient_id: data.id, ...cond };
            await supabase.from('chronic_conditions').insert([condObj]);
          }
        }
        return data;
      }
    } catch (e) {
      console.warn('Patient creation in Supabase failed, saving to memory fallback:', e.message);
    }
  }

  authService.memoryPatients.push(newPatient);
  if (patientData.chronic_conditions) {
    for (const cond of patientData.chronic_conditions) {
      authService.memoryChronicConditions.push({ id: randomUUID(), patient_id: newPatient.id, ...cond });
    }
  }
  return newPatient;
};

export default {
  searchPatientByHealthId,
  createPatientHelper
};

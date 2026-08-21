import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { randomUUID } from 'crypto';
import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';
import patientService from './patientService.js';
import fingerprintMatchService from './fingerprintMatchService.js';

const memoryFingerprintCredentials = [];
const challengesMap = new Map();

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

/**
 * Clean domain hostname for WebAuthn RP ID (e.g., 'localhost' or 'domain.com')
 */
const getCleanRpId = (reqHostname) => {
  let host = reqHostname || 'localhost';
  if (host.includes(':')) {
    host = host.split(':')[0];
  }
  return host === '127.0.0.1' ? 'localhost' : host;
};

/**
 * Generate WebAuthn registration options for a doctor registering a patient's fingerprint.
 */
export const getRegisterOptions = async (userId, patientId, reqHostname) => {
  if (!patientId) {
    const error = new Error('patient_id is required');
    error.statusCode = 400;
    throw error;
  }

  // Verify patient exists
  const patient = await patientService.getPatientProfile(patientId);
  if (!patient) {
    const error = new Error(`Patient with ID '${patientId}' not found`);
    error.statusCode = 404;
    throw error;
  }

  const rpID = getCleanRpId(reqHostname);
  // Ensure user.id is a Uint8Array
  const userBuffer = Uint8Array.from(Buffer.from(patientId.replace(/-/g, '').slice(0, 32), 'utf8'));

  const options = await generateRegistrationOptions({
    rpName: 'SwasthyaSetu Medical PoC',
    rpID,
    userID: userBuffer,
    userName: patient.health_id || patient.full_name || 'patient',
    userDisplayName: patient.full_name || 'Patient',
    attestationType: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
  });

  challengesMap.set(`${userId}_reg_${patientId}`, options.challenge);
  return options;
};

/**
 * Verify WebAuthn registration response and save credential in database / memory.
 */
export const verifyRegister = async (userId, patientId, body, reqHostname, reqOrigin) => {
  if (!patientId || !body) {
    const error = new Error('patient_id and WebAuthn response body are required');
    error.statusCode = 400;
    throw error;
  }

  const expectedChallenge = challengesMap.get(`${userId}_reg_${patientId}`);
  if (!expectedChallenge) {
    const error = new Error('Registration challenge expired or not found. Please try again.');
    error.statusCode = 400;
    throw error;
  }

  const rpID = getCleanRpId(reqHostname);
  const origin = reqOrigin || `http://${rpID}:5173`;

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (verifyErr) {
    console.error('❌ WebAuthn Registration Verification Error:', verifyErr.message);
    const err = new Error(`WebAuthn verification failed: ${verifyErr.message}`);
    err.statusCode = 400;
    throw err;
  }

  if (!verification.verified || !verification.registrationInfo) {
    const error = new Error('WebAuthn credential verification failed');
    error.statusCode = 400;
    throw error;
  }

  const { credential } = verification.registrationInfo;
  const credentialID = body.id || credential.id;
  const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64');

  const credentialRecord = {
    id: randomUUID(),
    patient_id: patientId,
    webauthn_credential_id: credentialID,
    public_key: publicKeyBase64,
    registered_at: new Date().toISOString(),
  };

  let savedRecord = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('fingerprint_credentials')
        .insert([credentialRecord])
        .select()
        .single();

      if (!error && data) savedRecord = data;
      if (error) {
        console.warn('Supabase insert fingerprint_credentials error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase DB error saving fingerprint credential:', err.message);
    }
  }

  if (!savedRecord) {
    memoryFingerprintCredentials.push(credentialRecord);
    savedRecord = credentialRecord;
  }

  // Clear challenge after single use
  challengesMap.delete(`${userId}_reg_${patientId}`);

  return {
    verified: true,
    patient_id: patientId,
    credential_id: credentialID,
  };
};

/**
 * Generate WebAuthn authentication (login/scan) options.
 */
export const getAuthOptions = async (userId, reqHostname) => {
  const rpID = getCleanRpId(reqHostname);

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
  });

  challengesMap.set(`${userId}_auth`, options.challenge);
  return options;
};

/**
 * Verify WebAuthn authentication response, lookup patient, and return patient profile.
 */
export const verifyAuth = async (userId, body, reqHostname, reqOrigin) => {
  if (!body || (!body.id && !body.rawId)) {
    const error = new Error('WebAuthn authentication response is required');
    error.statusCode = 400;
    throw error;
  }

  const expectedChallenge = challengesMap.get(`${userId}_auth`);
  if (!expectedChallenge) {
    const error = new Error('Authentication challenge expired or not found. Please scan again.');
    error.statusCode = 400;
    throw error;
  }

  const credentialID = body.id || body.rawId;

  // Lookup matching credential in database / memory
  let matchedCredential = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('fingerprint_credentials')
        .select('*')
        .eq('webauthn_credential_id', credentialID)
        .single();

      if (!error && data) matchedCredential = data;
    } catch (err) {
      console.warn('Supabase fetch fingerprint_credentials error:', err.message);
    }
  }

  if (!matchedCredential) {
    matchedCredential = memoryFingerprintCredentials.find(c => c.webauthn_credential_id === credentialID);
  }

  if (!matchedCredential) {
    const error = new Error('No patient linked to this fingerprint yet. Try Health ID search instead.');
    error.statusCode = 404;
    throw error;
  }

  const rpID = getCleanRpId(reqHostname);
  const origin = reqOrigin || `http://${rpID}:5173`;
  const publicKeyUint8 = Uint8Array.from(Buffer.from(matchedCredential.public_key, 'base64'));

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: matchedCredential.webauthn_credential_id,
        publicKey: publicKeyUint8,
        counter: 0,
      },
    });
  } catch (verifyErr) {
    console.error('❌ WebAuthn Authentication Verification Error:', verifyErr.message);
    const err = new Error(`WebAuthn authentication failed: ${verifyErr.message}`);
    err.statusCode = 400;
    throw err;
  }

  if (!verification.verified) {
    const error = new Error('Fingerprint verification failed');
    error.statusCode = 401;
    throw error;
  }

  // Clear challenge after single use
  challengesMap.delete(`${userId}_auth`);

  // Fetch full patient profile using existing patientService logic
  const patientProfile = await patientService.getPatientProfile(matchedCredential.patient_id);
  if (!patientProfile) {
    const error = new Error('Linked patient record not found');
    error.statusCode = 404;
    throw error;
  }

  return patientProfile;
};

const memoryFingerprintTemplates = [];

/**
 * Registers / upserts a patient's physical fingerprint ISO/ANSI template.
 */
export const registerMantraTemplate = async (userId, patientId, templateData, qualityScore = 70) => {
  if (!patientId || !templateData) {
    const error = new Error('patient_id and template_data are required');
    error.statusCode = 400;
    throw error;
  }

  // Check patient exists
  const patient = await patientService.getPatientProfile(patientId);
  if (!patient) {
    const error = new Error(`Patient with ID '${patientId}' not found`);
    error.statusCode = 404;
    throw error;
  }

  const record = {
    id: randomUUID(),
    patient_id: patientId,
    template_data: templateData,
    quality_score: qualityScore || 70,
    registered_at: new Date().toISOString(),
  };

  let savedRecord = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('fingerprint_templates')
        .upsert([record], { onConflict: 'patient_id' })
        .select()
        .single();

      if (!error && data) savedRecord = data;
      if (error) {
        console.warn('Supabase upsert fingerprint_templates error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase DB error saving fingerprint template:', err.message);
    }
  }

  if (!savedRecord) {
    const idx = memoryFingerprintTemplates.findIndex(t => t.patient_id === patientId);
    if (idx !== -1) {
      memoryFingerprintTemplates[idx] = record;
    } else {
      memoryFingerprintTemplates.push(record);
    }
    savedRecord = record;
  }

  return {
    success: true,
    patient_id: patientId,
    quality_score: qualityScore,
  };
};

/**
 * Performs a 1:N biometric search against all stored fingerprint templates.
 */
export const searchMantraTemplate = async (userId, templateData) => {
  if (!templateData) {
    const error = new Error('template_data is required');
    error.statusCode = 400;
    throw error;
  }

  let allTemplates = [];

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('fingerprint_templates')
        .select('*');

      if (!error && data) allTemplates = data;
    } catch (err) {
      console.warn('Supabase fetch fingerprint_templates error:', err.message);
    }
  }

  if (allTemplates.length === 0) {
    allTemplates = memoryFingerprintTemplates;
  }

  if (allTemplates.length === 0) {
    const error = new Error('No matching patient found for this fingerprint');
    error.statusCode = 404;
    throw error;
  }

  // 1:N minutiae matching search
  const { patientId, score } = fingerprintMatchService.findMatchingPatient(templateData, allTemplates, 35);

  if (!patientId) {
    const error = new Error('No matching patient found for this fingerprint');
    error.statusCode = 404;
    throw error;
  }

  // Fetch matched patient details
  const patientProfile = await patientService.getPatientProfile(patientId);
  if (!patientProfile) {
    const error = new Error('Matching patient record not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...patientProfile,
    _matchScore: score,
  };
};

export default {
  getRegisterOptions,
  verifyRegister,
  getAuthOptions,
  verifyAuth,
  registerMantraTemplate,
  searchMantraTemplate,
  memoryFingerprintCredentials,
  memoryFingerprintTemplates,
};

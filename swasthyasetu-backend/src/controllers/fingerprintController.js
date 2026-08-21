import fingerprintService from '../services/fingerprintService.js';
import { formatSuccess, formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const getRegisterOptions = async (req, res, next) => {
  try {
    const { patient_id } = req.body;
    if (!patient_id) {
      return formatError(res, STATUS_CODES.BAD_REQUEST, 'patient_id is required');
    }
    const options = await fingerprintService.getRegisterOptions(req.user.id, patient_id, req.hostname);
    return formatSuccess(res, STATUS_CODES.OK, options, 'Registration options generated successfully');
  } catch (error) {
    next(error);
  }
};

export const verifyRegister = async (req, res, next) => {
  try {
    const { patient_id, response } = req.body;
    const authResponse = response || req.body;
    const targetPatientId = patient_id || req.body.patient_id;

    if (!targetPatientId) {
      return formatError(res, STATUS_CODES.BAD_REQUEST, 'patient_id is required');
    }

    const result = await fingerprintService.verifyRegister(
      req.user.id,
      targetPatientId,
      authResponse,
      req.hostname,
      req.headers.origin
    );

    return formatSuccess(res, STATUS_CODES.OK, result, 'Fingerprint credential registered successfully');
  } catch (error) {
    next(error);
  }
};

export const getAuthOptions = async (req, res, next) => {
  try {
    const options = await fingerprintService.getAuthOptions(req.user.id, req.hostname);
    return formatSuccess(res, STATUS_CODES.OK, options, 'Authentication options generated successfully');
  } catch (error) {
    next(error);
  }
};

export const verifyAuth = async (req, res, next) => {
  try {
    const authResponse = req.body.response || req.body;
    const patientData = await fingerprintService.verifyAuth(
      req.user.id,
      authResponse,
      req.hostname,
      req.headers.origin
    );

    return formatSuccess(res, STATUS_CODES.OK, patientData, 'Patient retrieved by fingerprint scan');
  } catch (error) {
    next(error);
  }
};

export const registerMantra = async (req, res, next) => {
  try {
    const { patient_id, template_data, quality_score } = req.body;
    if (!patient_id) {
      return formatError(res, STATUS_CODES.BAD_REQUEST, 'patient_id is required');
    }
    if (!template_data) {
      return formatError(res, STATUS_CODES.BAD_REQUEST, 'template_data is required');
    }

    const result = await fingerprintService.registerMantraTemplate(
      req.user.id,
      patient_id,
      template_data,
      quality_score
    );

    return formatSuccess(res, STATUS_CODES.CREATED, result, 'Fingerprint template registered successfully');
  } catch (error) {
    next(error);
  }
};

export const searchMantra = async (req, res, next) => {
  try {
    const { template_data } = req.body;
    if (!template_data) {
      return formatError(res, STATUS_CODES.BAD_REQUEST, 'template_data is required');
    }

    const patientData = await fingerprintService.searchMantraTemplate(
      req.user.id,
      template_data
    );

    return formatSuccess(res, STATUS_CODES.OK, patientData, 'Matching patient retrieved by fingerprint scan');
  } catch (error) {
    next(error);
  }
};

export default {
  getRegisterOptions,
  verifyRegister,
  getAuthOptions,
  verifyAuth,
  registerMantra,
  searchMantra,
};

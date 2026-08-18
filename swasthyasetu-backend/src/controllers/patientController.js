import { query, validationResult } from 'express-validator';
import patientService from '../services/patientService.js';
import auditService from '../services/auditService.js';
import { formatSuccess, formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const validatePatientSearch = [
  query('health_id').notEmpty().withMessage('health_id query parameter is required')
];

export const searchPatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return formatError(res, STATUS_CODES.BAD_REQUEST, 'Validation failed', errors.array());
    }

    const { health_id } = req.query;
    const result = await patientService.searchPatientByHealthId(health_id);

    if (req.user?.id && result?.id) {
      await auditService.logAudit(req.user.id, 'viewed_patient_record', 'patients', result.id);
    }

    return formatSuccess(res, STATUS_CODES.OK, result, 'Patient profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientProfileByUserId(req.user.id);
    return formatSuccess(res, STATUS_CODES.OK, patient, 'Patient profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyConsultations = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientProfileByUserId(req.user.id);
    const result = await patientService.getPatientConsultations(patient.id);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Patient consultations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyPrescriptions = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientProfileByUserId(req.user.id);
    const result = await patientService.getPatientPrescriptions(patient.id);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Patient prescriptions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyLabOrders = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientProfileByUserId(req.user.id);
    const result = await patientService.getPatientLabOrders(patient.id);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Patient lab orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyLabReports = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientProfileByUserId(req.user.id);
    const result = await patientService.getPatientLabReports(patient.id);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Patient lab reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyChronicConditions = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientProfileByUserId(req.user.id);
    const result = await patientService.getChronicConditionsByPatientId(patient.id);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Patient chronic conditions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  searchPatient,
  getMyProfile,
  getMyConsultations,
  getMyPrescriptions,
  getMyLabOrders,
  getMyLabReports,
  getMyChronicConditions
};

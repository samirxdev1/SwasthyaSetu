import { body, param, validationResult } from 'express-validator';
import consultationService from '../services/consultationService.js';
import { formatSuccess, formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const validateCreateConsultation = [
  body('patient_id').notEmpty().withMessage('patient_id is required')
];

export const validateGetPatientConsultations = [
  param('patientId').notEmpty().withMessage('patientId parameter is required')
];

export const validateUpdateConsultation = [
  param('id').notEmpty().withMessage('Consultation ID parameter is required')
];

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    formatError(res, STATUS_CODES.BAD_REQUEST, 'Validation failed', errors.array());
    return false;
  }
  return true;
};

export const createConsultation = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const result = await consultationService.createConsultation(req.user.id, req.body);
    return formatSuccess(res, STATUS_CODES.CREATED, result, 'Consultation created successfully');
  } catch (error) {
    next(error);
  }
};

export const getPatientConsultations = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { patientId } = req.params;
    const result = await consultationService.getConsultationsByPatientId(patientId);

    return formatSuccess(res, STATUS_CODES.OK, result, 'Patient consultations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateConsultation = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { id } = req.params;
    const result = await consultationService.updateConsultation(id, req.user.id, req.body);

    return formatSuccess(res, STATUS_CODES.OK, result, 'Consultation updated successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  createConsultation,
  getPatientConsultations,
  updateConsultation
};

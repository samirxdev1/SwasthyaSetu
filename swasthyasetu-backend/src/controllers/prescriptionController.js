import { body, param, validationResult } from 'express-validator';
import prescriptionService from '../services/prescriptionService.js';
import { formatSuccess, formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const validateCreatePrescription = [
  body('consultation_id').notEmpty().withMessage('consultation_id is required'),
  body('medicine_name').notEmpty().withMessage('medicine_name is required'),
  body('dosage').notEmpty().withMessage('dosage is required')
];

export const validateGetConsultationPrescriptions = [
  param('consultationId').notEmpty().withMessage('consultationId parameter is required')
];

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    formatError(res, STATUS_CODES.BAD_REQUEST, 'Validation failed', errors.array());
    return false;
  }
  return true;
};

export const createPrescription = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const result = await prescriptionService.createPrescription(req.user.id, req.body);
    return formatSuccess(res, STATUS_CODES.CREATED, result, 'Prescription created successfully');
  } catch (error) {
    next(error);
  }
};

export const getConsultationPrescriptions = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { consultationId } = req.params;
    const result = await prescriptionService.getPrescriptionsByConsultationId(consultationId);

    return formatSuccess(res, STATUS_CODES.OK, result, 'Prescriptions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  createPrescription,
  getConsultationPrescriptions
};

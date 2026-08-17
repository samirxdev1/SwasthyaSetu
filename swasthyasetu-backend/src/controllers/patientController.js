import { query, validationResult } from 'express-validator';
import patientService from '../services/patientService.js';
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

    return formatSuccess(res, STATUS_CODES.OK, result, 'Patient profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  searchPatient
};

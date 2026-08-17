import { body, param, validationResult } from 'express-validator';
import labOrderService from '../services/labOrderService.js';
import { formatSuccess, formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const validateCreateLabOrder = [
  body('consultation_id').notEmpty().withMessage('consultation_id is required'),
  body('patient_id').notEmpty().withMessage('patient_id is required'),
  body('test_name').notEmpty().withMessage('test_name is required')
];

export const validateAcceptLabOrder = [
  param('id').notEmpty().withMessage('Lab order ID parameter is required')
];

export const validateGetPatientLabOrders = [
  param('patientId').notEmpty().withMessage('patientId parameter is required')
];

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    formatError(res, STATUS_CODES.BAD_REQUEST, 'Validation failed', errors.array());
    return false;
  }
  return true;
};

export const createLabOrder = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const result = await labOrderService.createLabOrder(req.user.id, req.body);
    return formatSuccess(res, STATUS_CODES.CREATED, result, 'Lab order created successfully');
  } catch (error) {
    next(error);
  }
};

export const getPendingLabOrders = async (req, res, next) => {
  try {
    const result = await labOrderService.getPendingLabOrders();
    return formatSuccess(res, STATUS_CODES.OK, result, 'Pending lab orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const acceptLabOrder = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { id } = req.params;
    const result = await labOrderService.acceptLabOrder(id, req.user.id);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Lab order accepted successfully');
  } catch (error) {
    next(error);
  }
};

export const getLaboratoryLabOrders = async (req, res, next) => {
  try {
    const result = await labOrderService.getLaboratoryLabOrders(req.user.id);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Laboratory assigned orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPatientLabOrders = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { patientId } = req.params;
    const result = await labOrderService.getPatientLabOrders(patientId);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Patient lab orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  createLabOrder,
  getPendingLabOrders,
  acceptLabOrder,
  getLaboratoryLabOrders,
  getPatientLabOrders
};

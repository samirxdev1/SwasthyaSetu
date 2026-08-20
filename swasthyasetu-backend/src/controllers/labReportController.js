import { body, param, validationResult } from 'express-validator';
import labReportService from '../services/labReportService.js';
import auditService from '../services/auditService.js';
import { formatSuccess, formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const validateCreateLabReport = [
  body('lab_order_id').notEmpty().withMessage('lab_order_id is required')
];

export const validateGetReportByOrder = [
  param('labOrderId').notEmpty().withMessage('labOrderId parameter is required')
];

export const validateGetPublicReport = [
  param('shareToken').notEmpty().withMessage('shareToken parameter is required')
];

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    formatError(res, STATUS_CODES.BAD_REQUEST, 'Validation failed', errors.array());
    return false;
  }
  return true;
};

export const createLabReport = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const result = await labReportService.createLabReport(req.user.id, req.file, req.body);
    if (req.user?.id && result?.id) {
      await auditService.logAudit(req.user.id, 'uploaded_report', 'lab_reports', result.id);
    }
    return formatSuccess(res, STATUS_CODES.CREATED, result, 'Lab report uploaded successfully');
  } catch (error) {
    next(error);
  }
};

export const getLabReportByOrder = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { labOrderId } = req.params;
    const result = await labReportService.getReportForLabOrder(req.user.id, labOrderId);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Lab report retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPublicLabReport = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { shareToken } = req.params;
    const result = await labReportService.getLabReportByShareToken(shareToken);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Public lab report retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  createLabReport,
  getLabReportByOrder,
  getPublicLabReport
};


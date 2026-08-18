import { param, validationResult } from 'express-validator';
import notificationService from '../services/notificationService.js';
import { formatSuccess, formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const validateMarkAsRead = [
  param('id').notEmpty().withMessage('Notification ID parameter is required')
];

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    formatError(res, STATUS_CODES.BAD_REQUEST, 'Validation failed', errors.array());
    return false;
  }
  return true;
};

export const getUserNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getUserNotifications(req.user.id);
    return formatSuccess(res, STATUS_CODES.OK, result, 'User notifications retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { id } = req.params;
    const result = await notificationService.markNotificationAsRead(id, req.user.id);
    return formatSuccess(res, STATUS_CODES.OK, result, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export default {
  getUserNotifications,
  markAsRead
};

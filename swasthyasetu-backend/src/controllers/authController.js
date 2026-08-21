import { body, validationResult } from 'express-validator';
import authService from '../services/authService.js';
import { formatSuccess, formatError } from '../utils/responseFormatter.js';
import { ROLES } from '../constants/roles.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const validateDoctorRegister = [
  body('email').optional().isEmail().withMessage('Please provide a valid email address'),
  body('phone').optional().notEmpty().withMessage('Please provide a valid phone number'),
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('Either email or phone must be provided');
    }
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('registration_number').notEmpty().withMessage('Medical registration number is required')
];

export const validateLabRegister = [
  body('email').optional().isEmail().withMessage('Please provide a valid email address'),
  body('phone').optional().notEmpty().withMessage('Please provide a valid phone number'),
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('Either email or phone must be provided');
    }
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('lab_name').notEmpty().withMessage('Laboratory name is required'),
  body().custom((value, { req }) => {
    if (!req.body.registration_number && !req.body.license_number) {
      throw new Error('Registration number is required');
    }
    return true;
  })
];

export const validatePatientRegister = [
  body('email').optional().isEmail().withMessage('Please provide a valid email address'),
  body('phone').optional().notEmpty().withMessage('Please provide a valid phone number'),
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('Either email or phone must be provided');
    }
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('health_id').notEmpty().withMessage('Health ID is required')
];

export const validateLogin = [
  body('identifier').notEmpty().withMessage('Email or phone number is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    formatError(res, STATUS_CODES.BAD_REQUEST, 'Validation failed', errors.array());
    return false;
  }
  return true;
};

export const registerDoctor = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const result = await authService.registerUser({
      ...req.body,
      role: ROLES.DOCTOR
    });

    return formatSuccess(res, STATUS_CODES.CREATED, result, 'Doctor registered successfully');
  } catch (error) {
    next(error);
  }
};

export const registerLaboratory = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const result = await authService.registerUser({
      ...req.body,
      role: ROLES.LABORATORY
    });

    return formatSuccess(res, STATUS_CODES.CREATED, result, 'Laboratory registered successfully');
  } catch (error) {
    next(error);
  }
};

export const registerPatient = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const result = await authService.registerUser({
      ...req.body,
      role: ROLES.PATIENT
    });

    return formatSuccess(res, STATUS_CODES.CREATED, result, 'Patient registered successfully');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { identifier, password } = req.body;
    const result = await authService.loginUser(identifier, password);

    return formatSuccess(res, STATUS_CODES.OK, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return formatError(res, STATUS_CODES.UNAUTHORIZED, 'User context not found in request');
    }

    const result = await authService.getUserProfile(userId);
    return formatSuccess(res, STATUS_CODES.OK, result, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return formatError(res, STATUS_CODES.UNAUTHORIZED, 'User context not found in request');
    }

    const result = await authService.updateUserProfile(userId, req.body);
    return formatSuccess(res, STATUS_CODES.OK, result, 'User profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  registerDoctor,
  registerLaboratory,
  registerPatient,
  login,
  getCurrentUser,
  updateCurrentUser
};


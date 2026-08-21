import express from 'express';
import fingerprintController from '../controllers/fingerprintController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleCheck from '../middleware/roleCheckMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// POST /api/fingerprint/register-options (Doctor only)
router.post(
  '/register-options',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  fingerprintController.getRegisterOptions
);

// POST /api/fingerprint/register-verify (Doctor only)
router.post(
  '/register-verify',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  fingerprintController.verifyRegister
);

// POST /api/fingerprint/auth-options (Doctor only)
router.post(
  '/auth-options',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  fingerprintController.getAuthOptions
);

// POST /api/fingerprint/auth-verify (Doctor only)
router.post(
  '/auth-verify',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  fingerprintController.verifyAuth
);

// POST /api/fingerprint/register (Hardware Mantra scanner template registration, Doctor only)
router.post(
  '/register',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  fingerprintController.registerMantra
);

// POST /api/fingerprint/search (Hardware Mantra scanner 1:N biometric search, Doctor only)
router.post(
  '/search',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  fingerprintController.searchMantra
);

export default router;

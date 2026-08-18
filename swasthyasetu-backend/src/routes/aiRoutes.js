import express from 'express';
import aiController, { validateCheckInteraction, validateAcknowledgeFlag } from '../controllers/aiController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleCheck from '../middleware/roleCheckMiddleware.js';
import uploadSingle from '../middleware/uploadMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// POST /api/ai/scan-prescription (Patient only)
router.post(
  '/scan-prescription',
  authMiddleware,
  roleCheck(ROLES.PATIENT),
  uploadSingle,
  aiController.scanPrescription
);

// POST /api/ai/check-interaction (Doctor only)
router.post(
  '/check-interaction',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  validateCheckInteraction,
  aiController.checkDrugInteraction
);

export default router;


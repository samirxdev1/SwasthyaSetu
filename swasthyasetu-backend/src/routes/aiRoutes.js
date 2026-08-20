import express from 'express';
import aiController, {
  validateCheckInteraction,
  validateAcknowledgeFlag,
  validateChatMessage
} from '../controllers/aiController.js';
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

// POST /api/ai/chat (Patient only)
// Uses tool-calling to fetch the authenticated patient's own real data before answering.
// patientId is resolved from the JWT — the request body cannot influence which patient's
// data is queried (structural security, not just prompt-level).
router.post(
  '/chat',
  authMiddleware,
  roleCheck(ROLES.PATIENT),
  validateChatMessage,
  aiController.chatWithAssistant
);

export default router;



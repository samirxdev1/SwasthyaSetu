import express from 'express';
import aiController, { validateAcknowledgeFlag } from '../controllers/aiController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleCheck from '../middleware/roleCheckMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// PATCH /api/drug-interaction-flags/:id/acknowledge (Doctor only)
router.patch(
  '/:id/acknowledge',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  validateAcknowledgeFlag,
  aiController.acknowledgeFlag
);

export default router;

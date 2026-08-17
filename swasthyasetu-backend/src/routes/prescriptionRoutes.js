import express from 'express';
import prescriptionController, {
  validateCreatePrescription,
  validateGetConsultationPrescriptions
} from '../controllers/prescriptionController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleCheck from '../middleware/roleCheckMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// POST /api/prescriptions (Doctor only)
router.post(
  '/',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  validateCreatePrescription,
  prescriptionController.createPrescription
);

// GET /api/prescriptions/consultation/:consultationId (Doctor or Patient)
router.get(
  '/consultation/:consultationId',
  authMiddleware,
  roleCheck(ROLES.DOCTOR, ROLES.PATIENT),
  validateGetConsultationPrescriptions,
  prescriptionController.getConsultationPrescriptions
);

export default router;

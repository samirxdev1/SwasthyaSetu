import express from 'express';
import consultationController, {
  validateCreateConsultation,
  validateGetPatientConsultations,
  validateUpdateConsultation
} from '../controllers/consultationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleCheck from '../middleware/roleCheckMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// POST /api/consultations (Doctor only)
router.post(
  '/',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  validateCreateConsultation,
  consultationController.createConsultation
);

// GET /api/consultations/patient/:patientId (Doctor, Laboratory, or Patient)
router.get(
  '/patient/:patientId',
  authMiddleware,
  roleCheck(ROLES.DOCTOR, ROLES.LABORATORY, ROLES.PATIENT),
  validateGetPatientConsultations,
  consultationController.getPatientConsultations
);

// PATCH /api/consultations/:id (Doctor only)
router.patch(
  '/:id',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  validateUpdateConsultation,
  consultationController.updateConsultation
);

export default router;

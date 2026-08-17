import express from 'express';
import patientController, { validatePatientSearch } from '../controllers/patientController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleCheck from '../middleware/roleCheckMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// GET /api/patients/search?health_id=<value>
// Restricted to doctors and laboratories
router.get(
  '/search',
  authMiddleware,
  roleCheck(ROLES.DOCTOR, ROLES.LABORATORY),
  validatePatientSearch,
  patientController.searchPatient
);

export default router;

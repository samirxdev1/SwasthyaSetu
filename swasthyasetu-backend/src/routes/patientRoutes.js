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

// GET /api/patients/me - Retrieve own profile (Restricted to patients only)
router.get(
  '/me',
  authMiddleware,
  roleCheck(ROLES.PATIENT),
  patientController.getMyProfile
);

// GET /api/patients/me/consultations - Retrieve own consultations (Restricted to patients only)
router.get(
  '/me/consultations',
  authMiddleware,
  roleCheck(ROLES.PATIENT),
  patientController.getMyConsultations
);

// GET /api/patients/me/prescriptions - Retrieve own prescriptions (Restricted to patients only)
router.get(
  '/me/prescriptions',
  authMiddleware,
  roleCheck(ROLES.PATIENT),
  patientController.getMyPrescriptions
);

// GET /api/patients/me/lab-orders - Retrieve own lab orders (Restricted to patients only)
router.get(
  '/me/lab-orders',
  authMiddleware,
  roleCheck(ROLES.PATIENT),
  patientController.getMyLabOrders
);

// GET /api/patients/me/lab-reports - Retrieve own lab reports (Restricted to patients only)
router.get(
  '/me/lab-reports',
  authMiddleware,
  roleCheck(ROLES.PATIENT),
  patientController.getMyLabReports
);

// GET /api/patients/me/chronic-conditions - Retrieve own chronic conditions (Restricted to patients only)
router.get(
  '/me/chronic-conditions',
  authMiddleware,
  roleCheck(ROLES.PATIENT),
  patientController.getMyChronicConditions
);

export default router;

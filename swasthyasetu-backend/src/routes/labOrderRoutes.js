import express from 'express';
import labOrderController, {
  validateCreateLabOrder,
  validateAcceptLabOrder,
  validateGetPatientLabOrders
} from '../controllers/labOrderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleCheck from '../middleware/roleCheckMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// POST /api/lab-orders (Doctor only)
router.post(
  '/',
  authMiddleware,
  roleCheck(ROLES.DOCTOR),
  validateCreateLabOrder,
  labOrderController.createLabOrder
);

// GET /api/lab-orders/pending (Laboratory only)
router.get(
  '/pending',
  authMiddleware,
  roleCheck(ROLES.LABORATORY),
  labOrderController.getPendingLabOrders
);

// PATCH /api/lab-orders/:id/accept (Laboratory only)
router.patch(
  '/:id/accept',
  authMiddleware,
  roleCheck(ROLES.LABORATORY),
  validateAcceptLabOrder,
  labOrderController.acceptLabOrder
);

// GET /api/lab-orders/laboratory (Laboratory only)
router.get(
  '/laboratory',
  authMiddleware,
  roleCheck(ROLES.LABORATORY),
  labOrderController.getLaboratoryLabOrders
);

// GET /api/lab-orders/patient/:patientId (Doctor, Laboratory, or Patient)
router.get(
  '/patient/:patientId',
  authMiddleware,
  roleCheck(ROLES.DOCTOR, ROLES.LABORATORY, ROLES.PATIENT),
  validateGetPatientLabOrders,
  labOrderController.getPatientLabOrders
);

export default router;

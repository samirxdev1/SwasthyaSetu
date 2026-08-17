import express from 'express';
import labReportController, {
  validateCreateLabReport,
  validateGetReportByOrder
} from '../controllers/labReportController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleCheck from '../middleware/roleCheckMiddleware.js';
import uploadSingle from '../middleware/uploadMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// POST /api/lab-reports (Laboratory only, multipart/form-data with file upload)
router.post(
  '/',
  authMiddleware,
  roleCheck(ROLES.LABORATORY),
  uploadSingle,
  validateCreateLabReport,
  labReportController.createLabReport
);

// GET /api/lab-reports/order/:labOrderId (Doctor who ordered it, Laboratory who uploaded it, or Patient)
router.get(
  '/order/:labOrderId',
  authMiddleware,
  roleCheck(ROLES.DOCTOR, ROLES.LABORATORY, ROLES.PATIENT),
  validateGetReportByOrder,
  labReportController.getLabReportByOrder
);

export default router;

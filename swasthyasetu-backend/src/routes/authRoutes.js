import express from 'express';
import authController, {
  validateDoctorRegister,
  validateLabRegister,
  validatePatientRegister,
  validateLogin
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Auth Endpoints
router.post('/register/doctor', validateDoctorRegister, authController.registerDoctor);
router.post('/register/laboratory', validateLabRegister, authController.registerLaboratory);
router.post('/register/patient', validatePatientRegister, authController.registerPatient);
router.post('/login', validateLogin, authController.login);

// Protected User Endpoint
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;

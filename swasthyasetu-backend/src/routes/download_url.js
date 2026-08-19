import express from 'express';
import { downloadApk } from '../controllers/downloadController.js'
const router = express.Router();

router.get('/download/app', downloadApk);

export default router;

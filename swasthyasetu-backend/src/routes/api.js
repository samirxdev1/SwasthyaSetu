import { Router } from 'express';

const router = Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SwasthyaSetu API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Sample API Endpoint
router.get('/status', (req, res) => {
  res.json({
    service: 'SwasthyaSetu Backend Service',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

export default router;

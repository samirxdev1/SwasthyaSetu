import express from 'express';
import notificationController, { validateMarkAsRead } from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/notifications - Retrieve current user's notifications
router.get(
  '/',
  authMiddleware,
  notificationController.getUserNotifications
);

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch(
  '/:id/read',
  authMiddleware,
  validateMarkAsRead,
  notificationController.markAsRead
);

export default router;

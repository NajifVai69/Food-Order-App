import express from 'express';
import {
  getUserNotifications,
  getLatestOrderNotification,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user notifications for dashboard
router.get('/', getUserNotifications);

// Get latest confirmed order notification
router.get('/latest', getLatestOrderNotification);

// Mark notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

export default router;

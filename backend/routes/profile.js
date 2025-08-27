import express from 'express';
import {
  getProfile,
  updateProfile,
  addDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCustomerDashboard,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all profile routes
router.use(protect);

// Common profile routes for all user types
router.get('/', getProfile);              // GET /api/profile - Get user profile
router.put('/', updateProfile);          // PUT /api/profile - Update profile info



// ✅ ADD ONLY THESE NEW DASHBOARD ROUTES
router.get('/dashboard', getCustomerDashboard);                          // GET /api/profile/dashboard
router.patch('/notifications/:notificationId/read', markNotificationRead); // PATCH /api/profile/notifications/:id/read
router.patch('/notifications/mark-all-read', markAllNotificationsRead);    // PATCH /api/profile/notifications/mark-all-read

// Customer-specific routes for address management
router.post('/addresses', addDeliveryAddress);         // POST /api/profile/addresses
router.put('/addresses/:addressId', updateDeliveryAddress);   // PUT /api/profile/addresses/:id
router.delete('/addresses/:addressId', deleteDeliveryAddress); // DELETE /api/profile/addresses/:id

// Owner-specific routes for menu management
router.post('/menu-items', addMenuItem);              // POST /api/profile/menu-items
router.put('/menu-items/:itemId', updateMenuItem);    // PUT /api/profile/menu-items/:id
router.delete('/menu-items/:itemId', deleteMenuItem); // DELETE /api/profile/menu-items/:id

export default router;
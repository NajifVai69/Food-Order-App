import express from 'express';
import {
  getAssignedRestaurants,
  updateRestaurantInfo,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/restaurantManagementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get restaurants assigned to owner
router.get('/assigned', getAssignedRestaurants);

// Update restaurant information
router.put('/:restaurantId', updateRestaurantInfo);

// Menu item management
router.post('/:restaurantId/menu-items', addMenuItem);
router.put('/:restaurantId/menu-items/:itemId', updateMenuItem);
router.delete('/:restaurantId/menu-items/:itemId', deleteMenuItem);

export default router;

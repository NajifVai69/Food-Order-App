import express from 'express';
import { addRestaurant, deleteRestaurant, getRestaurants } from '../controllers/manageRestaurantController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, isAdmin, getRestaurants);
router.post('/', protect, isAdmin, addRestaurant);
router.delete('/:id', protect, isAdmin, deleteRestaurant);
export default router;

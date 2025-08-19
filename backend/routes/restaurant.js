import express from 'express';
import { addRestaurant, deleteRestaurant, getRestaurants } from '../controllers/restaurantController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', getRestaurants);
router.post('/', protect, addRestaurant);
router.delete('/:id', protect, deleteRestaurant);
export default router;

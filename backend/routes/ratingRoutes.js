import express from 'express'
import {
  createRating,
  getRestaurantRatings,
  updateRating,
  deleteRating
} from '../controllers/ratingController.js';
import { protect } from'../middlewares/auth.js'

const router = express.Router();

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantRatings);

// Protected routes
router.post('/', protect, createRating);
router.route('/:id')
  .put(protect, updateRating)
  .delete(protect, deleteRating);

export default router

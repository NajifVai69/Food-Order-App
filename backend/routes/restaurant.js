import express from 'express';
import { 
  addRestaurant, 
  deleteRestaurant, 
  getRestaurants,
  getRestaurantDetails,
  rateRestaurant,
  getUserRating,
  deleteRating,
  getRestaurantRatings,
  assignOwner // Add this
} from '../controllers/restaurantController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantDetails);
router.get('/:id/ratings', getRestaurantRatings);

// Protected routes (require authentication)
router.post('/', protect, addRestaurant);
router.delete('/:id', protect, deleteRestaurant);
router.post('/assign-owner', protect, assignOwner); // Add this

// Rating routes (require authentication)
router.post('/:id/rate', protect, rateRestaurant);
router.get('/:id/my-rating', protect, getUserRating);
router.delete('/:id/my-rating', protect, deleteRating);

export default router;

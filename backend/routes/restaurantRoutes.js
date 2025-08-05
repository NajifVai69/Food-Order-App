import express from "express"
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from '../controllers/restaurantController.js'

const router = express.Router();

// Public routes
router.route('/')
  .get(getRestaurants)
  .post(createRestaurant); // Should add admin middleware in production

router.route('/:id')
  .get(getRestaurantById)
  .put(updateRestaurant) // Should add admin middleware in production
  .delete(deleteRestaurant); // Should add admin middleware in production

export default router
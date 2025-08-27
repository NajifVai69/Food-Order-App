import express from "express";
import { 
  createOrder, 
  getOrders, 
  getOwnerOrders, 
  updateOrderStatus,
  getOrderStatus // import the new controller method
} from "../controllers/orderController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Keep your existing checkout route
router.post("/checkout", protect, createOrder);

// Existing routes
router.get("/", protect, getOrders);
router.get("/owner", protect, getOwnerOrders);
router.patch("/:orderId/status", protect, updateOrderStatus);

// Add the new GET route here
router.get("/:orderId/status", protect, getOrderStatus);

export default router;

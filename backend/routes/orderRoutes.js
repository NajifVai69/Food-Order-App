import express from "express";
import { createOrder, getOrders, getOwnerOrders, updateOrderStatus,  } from "../controllers/orderController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Keep your existing checkout route
router.post("/checkout", protect, createOrder);

// Add these new routes for testing and management
router.get("/", protect, getOrders);

router.get("/owner", protect, getOwnerOrders);
router.patch("/:orderId/status", protect, updateOrderStatus);
export default router;

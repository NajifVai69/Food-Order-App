import { createOrderNotification } from './notificationController.js';
import Order from "../models/order.js";
import Restaurant from "../models/restaurant.js";


export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      total,
      paymentMethod,
    } = req.body;

    console.log("Incoming Order:", req.body);

    if (!customerName || !customerPhone || !total || !paymentMethod) {
      return res.status(400).json({
        error: "missing required fields",
        required: ["customerName", "customerPhone", "total", "paymentMethod"],
        received: { customerName, customerPhone, total, paymentMethod },
      });
    }

    const newOrder = new Order({
      customerName,
      customerPhone,
      customerEmail,
      items,
      total,
      paymentMethod,
      user: req.user?._id // Add user reference if authenticated
    });

    const savedOrder = await newOrder.save();

    // ✅ CREATE NOTIFICATION USING SEPARATE NOTIFICATION CONTROLLER
    if (req.user && req.user._id) {
      try {
        const notificationResult = await createOrderNotification(
          savedOrder._id, 
          req.user._id, 
          'ORDER_CONFIRMED'
        );
        
        if (notificationResult.success) {
          console.log('Order confirmation notification created');
        } else {
          console.error('Failed to create notification:', notificationResult.error);
        }
      } catch (notificationError) {
        console.error('Notification creation error:', notificationError);
        // Don't fail the order creation if notification fails
      }
    }

    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });

  } catch (err) {
    console.error("Order creation failed", err.message);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Failed",
        details: err.errors,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};





// Keep your existing getOrders function unchanged
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("error fetching orders:", err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get orders for owner's restaurants
export const getOwnerOrders = async (req, res) => {
  try {
    if (req.user.userType !== 'Owner') {
      return res.status(403).json({ message: 'Access denied. Owners only.' });
    }

    // Find restaurants owned by this owner
    const ownerRestaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = ownerRestaurants.map(r => r._id);

    // Find orders that contain items from owner's restaurants
    const orders = await Order.find({
      'items.restaurant': { $in: restaurantIds }
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching owner orders:", err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};




// ✅ ADD ORDER STATUS UPDATE FUNCTION
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Create notification for status change (if you have notifications set up)
    if (order.user) {
      try {
        let notificationType;
        switch (status) {
          case 'Delivered':
            notificationType = 'ORDER_DELIVERED';
            break;
          case 'Cancelled':
            notificationType = 'ORDER_CANCELLED';
            break;
          default:
            notificationType = 'ORDER_CONFIRMED';
        }

        // Only try to create notification if function exists
        if (typeof createOrderNotification === 'function') {
          const notificationResult = await createOrderNotification(orderId, order.user, notificationType);
          if (notificationResult.success) {
            console.log(`${notificationType} notification created`);
          }
        }
      } catch (notificationError) {
        console.log('Notification creation skipped:', notificationError.message);
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

const calculateOrderStatus = (createdAt) => {
  const now = new Date();
  const elapsedMinutes = (now - new Date(createdAt)) / 60000; // time diff in minutes

  if (elapsedMinutes >= 20) return "Delivered";
  if (elapsedMinutes >= 15) return "On the way";
  if (elapsedMinutes >= 5) return "Preparing";
  if (elapsedMinutes >= 0) return "Confirmed";
  return "Pending";
};

export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const status = calculateOrderStatus(order.createdAt);

    res.status(200).json({
      orderId: order._id,
      status,
      estimatedDeliveryTime: 20, // in minutes
      timeElapsed: (new Date() - order.createdAt) / 60000,
    });
  } catch (error) {
    console.error("Error fetching order status", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



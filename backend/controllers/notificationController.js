import Notification from '../models/notification.js';
import Order from '../models/order.js';

// Create order notification
export const createOrderNotification = async (orderId, userId, type = 'ORDER_CONFIRMED') => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    let title, message;
    
    switch (type) {
      case 'ORDER_CONFIRMED':
        title = 'Food Order Confirmed';
        message = `Your order #${orderId.toString().slice(-6)} has been confirmed and is being prepared. Total: ৳${order.total}`;
        break;
      case 'ORDER_DELIVERED':
        title = 'Order Delivered';
        message = `Your order #${orderId.toString().slice(-6)} has been delivered successfully. Enjoy your meal!`;
        break;
      case 'ORDER_CANCELLED':
        title = 'Order Cancelled';
        message = `Your order #${orderId.toString().slice(-6)} has been cancelled. Refund will be processed if applicable.`;
        break;
      default:
        title = 'Order Update';
        message = `Your order #${orderId.toString().slice(-6)} has been updated.`;
    }

    const notification = new Notification({
      title,
      message,
      type,
      user: userId,
      order: orderId
    });

    await notification.save();
    
    return {
      success: true,
      notification
    };
  } catch (error) {
    console.error('Create notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user notifications
export const getUserNotifications = async (userId, limit = 10) => {
  try {
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('order', 'customerName total status')
      .lean();

    return {
      success: true,
      notifications
    };
  } catch (error) {
    console.error('Get user notifications error:', error);
    return {
      success: false,
      notifications: [],
      error: error.message
    };
  }
};

// Get latest order notification
export const getLatestOrderNotification = async (userId) => {
  try {
    const notification = await Notification.findOne({ 
      user: userId, 
      type: { $in: ['ORDER_CONFIRMED', 'ORDER_DELIVERED', 'ORDER_CANCELLED'] }
    })
      .sort({ createdAt: -1 })
      .populate('order', 'customerName total status')
      .lean();

    return {
      success: true,
      notification
    };
  } catch (error) {
    console.error('Get latest notification error:', error);
    return {
      success: false,
      notification: null,
      error: error.message
    };
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId) => {
  try {
    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      isRead: false 
    });

    return {
      success: true,
      unreadCount
    };
  } catch (error) {
    console.error('Get unread count error:', error);
    return {
      success: false,
      unreadCount: 0,
      error: error.message
    };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return {
        success: false,
        message: 'Notification not found'
      };
    }

    await notification.markAsRead();

    return {
      success: true,
      message: 'Notification marked as read'
    };

  } catch (error) {
    console.error('Mark notification read error:', error);
    return {
      success: false,
      message: 'Failed to mark notification as read'
    };
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date() 
        } 
      }
    );

    return {
      success: true,
      message: 'All notifications marked as read'
    };

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return {
      success: false,
      message: 'Failed to mark all notifications as read'
    };
  }
};

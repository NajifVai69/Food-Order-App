import axios from 'axios';

const api = axios.create({
  baseURL:"https://food-order-app-production-7604.up.railway.app/api" ||'http://localhost:5000/api',
  //baseURL: 'food-order-app-production-7604.up.railway.app/api' || 'http://localhost:5000/api',
  withCredentials: true, // Important for cookie-based authentication
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Debug print removed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

// Restaurant API functions
export const restaurantApi = {
  // Get all restaurants (existing)
  getRestaurants: (params) => api.get('/restaurants', { params }),
  
  // Get restaurant details with menu and ratings
  getRestaurantDetails: (id) => api.get(`/restaurants/${id}`),
  
  // Rating system
  submitRating: (id, data) => api.post(`/restaurants/${id}/rate`, data),
  getUserRating: (id) => api.get(`/restaurants/${id}/my-rating`),
  deleteRating: (id) => api.delete(`/restaurants/${id}/my-rating`),
  getRestaurantRatings: (id, params) => api.get(`/restaurants/${id}/ratings`, { params })
};
  // Get all owners for assign owner dropdown
export const getAllOwners = () => api.get('/auth/owners');

// Assign owner to a restaurant (admin only)
export const assignRestaurantOwner = (restaurantId, ownerId) =>
  api.post('/restaurants/assign-owner', { restaurantId, ownerId });

// Add these restaurant management functions
export const restaurantManagementApi = {
  // Get restaurants assigned to owner
  getAssignedRestaurants: () => api.get('/restaurant-management/assigned'),
  
  // Update restaurant info
  updateRestaurantInfo: (restaurantId, data) => api.put(`/restaurant-management/${restaurantId}`, data),
  
  // Menu management
  addMenuItem: (restaurantId, data) => api.post(`/restaurant-management/${restaurantId}/menu-items`, data),
  updateMenuItem: (restaurantId, itemId, data) => api.put(`/restaurant-management/${restaurantId}/menu-items/${itemId}`, data),
  deleteMenuItem: (restaurantId, itemId) => api.delete(`/restaurant-management/${restaurantId}/menu-items/${itemId}`)
};


// Notification API functions
export const notificationApi = {
  // Get dashboard data (includes notifications)
  getDashboard: () => api.get('/profile/dashboard'),
  
  // Mark notification as read
  markAsRead: (notificationId) => api.patch(`/profile/notifications/${notificationId}/read`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.patch('/profile/notifications/mark-all-read')
};

// Add these order management functions for owners
export const orderApi = {
  // Get all orders (admin)
  getAllOrders: () => api.get('/orders'),
  
  // Get orders for owner's restaurants
  getOwnerOrders: () => api.get('/orders/owner'),
  
  // Update order status
  updateOrderStatus: (orderId, status) => 
    api.patch(`/orders/${orderId}/status`, { status }),
  
  // Get orders for specific user
  getUserOrders: (userId) => api.get(`/orders/user/${userId}`)
};



export default api;

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useUser } from './UserContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const { user } = useUser();

  // Fetch dashboard data (includes notifications)
  const fetchDashboard = async () => {
    if (!user || user.userType !== 'Customer') return;
    
    setLoading(true);
    try {
      const response = await api.get('/profile/dashboard');
      if (response.data.success) {
        const { data } = response.data;
        setDashboardData(data);
        setNotifications(data.unreadNotifications || []);
        setUnreadCount(data.stats.unreadNotifications || 0);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/profile/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.patch('/profile/notifications/mark-all-read');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Auto-refresh every 30 seconds when user is a customer
  useEffect(() => {
    if (user?.userType === 'Customer') {
      fetchDashboard();
      
      const interval = setInterval(() => {
        fetchDashboard();
      }, 30000); // 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    loading,
    dashboardData,
    fetchDashboard,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const styles = {
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: '0',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      width: '350px',
      maxHeight: '400px',
      zIndex: 1000,
      overflow: 'hidden'
    },
    header: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9fafb'
    },
    title: {
      margin: 0,
      fontSize: '1.1rem',
      fontWeight: '600'
    },
    markAllBtn: {
      background: 'none',
      border: 'none',
      color: '#3b82f6',
      fontSize: '0.9rem',
      cursor: 'pointer',
      fontWeight: '500'
    },
    content: {
      maxHeight: '300px',
      overflowY: 'auto'
    },
    notification: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #f3f4f6',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    unreadNotification: {
      backgroundColor: '#fef3c7'
    },
    notificationTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      margin: '0 0 0.25rem 0',
      color: '#111'
    },
    notificationMessage: {
      fontSize: '0.8rem',
      color: '#6b7280',
      margin: '0 0 0.25rem 0',
      lineHeight: '1.3'
    },
    notificationTime: {
      fontSize: '0.75rem',
      color: '#9ca3af'
    },
    empty: {
      padding: '2rem 1rem',
      textAlign: 'center',
      color: '#6b7280'
    },
    loading: {
      padding: '1rem',
      textAlign: 'center',
      color: '#6b7280'
    }
  };

  return (
    <div ref={dropdownRef} style={styles.dropdown}>
      <div style={styles.header}>
        <h3 style={styles.title}>Notifications</h3>
        {notifications.length > 0 && (
          <button 
            style={styles.markAllBtn}
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              style={{
                ...styles.notification,
                ...(notification.isRead ? {} : styles.unreadNotification)
              }}
              onClick={() => handleNotificationClick(notification)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = notification.isRead ? 'white' : '#fef3c7'}
            >
              <div style={styles.notificationTitle}>
                {notification.title}
              </div>
              <div style={styles.notificationMessage}>
                {notification.message}
              </div>
              <div style={styles.notificationTime}>
                {formatTime(notification.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

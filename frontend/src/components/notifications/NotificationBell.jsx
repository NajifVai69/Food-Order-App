import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block'
    },
    bell: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '50%',
      position: 'relative',
      transition: 'background-color 0.2s ease'
    },
    bellHover: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    badge: {
      position: 'absolute',
      top: '0.2rem',
      right: '0.2rem',
      backgroundColor: '#e11d48',
      color: 'white',
      borderRadius: '50%',
      width: '1.2rem',
      height: '1.2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.7rem',
      fontWeight: '700',
      minWidth: '1.2rem'
    }
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.bell}
        onClick={handleToggle}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        title={`${unreadCount} unread notifications`}
      >
        🔔
        {unreadCount > 0 && (
          <div style={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;

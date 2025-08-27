import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from './common/LoadingSpinner';

const CustomerDashboard = () => {
  const { dashboardData, loading } = useNotifications();

  if (loading) {
    return <LoadingSpinner />;
  }

  const { recentOrders, latestOrderNotification, stats } = dashboardData || {};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#22c55e';
      case 'Paid': return '#3b82f6';
      case 'Cancelled': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const styles = {
    container: {
      display: 'grid',
      gap: '1.5rem',
      marginTop: '1.5rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#111',
      margin: '0 0 0.5rem 0'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#6b7280',
      margin: 0
    },
    card: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: '0 0 1rem 0',
      color: '#111'
    },
    orderItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      marginBottom: '0.75rem'
    },
    orderInfo: {
      flex: 1
    },
    orderName: {
      fontSize: '0.95rem',
      fontWeight: '600',
      margin: '0 0 0.25rem 0'
    },
    orderMeta: {
      fontSize: '0.8rem',
      color: '#6b7280'
    },
    orderStatus: {
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.8rem',
      fontWeight: '500',
      color: 'white'
    },
    orderTotal: {
      fontSize: '1rem',
      fontWeight: '600',
      marginLeft: '1rem'
    },
    notificationCard: {
      backgroundColor: '#fef3c7',
      padding: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #f59e0b'
    },
    notificationTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      margin: '0 0 0.5rem 0',
      color: '#92400e'
    },
    notificationMessage: {
      fontSize: '0.9rem',
      color: '#78350f',
      margin: 0
    },
    emptyState: {
      textAlign: 'center',
      padding: '2rem',
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.container}>
      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats?.totalOrders || 0}</div>
          <div style={styles.statLabel}>Total Orders</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats?.unreadNotifications || 0}</div>
          <div style={styles.statLabel}>New Notifications</div>
        </div>
      </div>

      {/* Latest Notification */}
      {latestOrderNotification && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📢 Latest Update</h3>
          <div style={styles.notificationCard}>
            <div style={styles.notificationTitle}>
              {latestOrderNotification.title}
            </div>
            <div style={styles.notificationMessage}>
              {latestOrderNotification.message}
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={styles.cardTitle}>🍽️ Recent Orders</h3>
          <Link to="/profile" style={{ color: '#3b82f6', fontSize: '0.9rem', textDecoration: 'none' }}>
            View All
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <div key={order._id} style={styles.orderItem}>
              <div style={styles.orderInfo}>
                <div style={styles.orderName}>
                  Order #{order._id.slice(-6).toUpperCase()}
                </div>
                <div style={styles.orderMeta}>
                  {formatDate(order.createdAt)} • {order.customerName}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div 
                  style={{
                    ...styles.orderStatus,
                    backgroundColor: getStatusColor(order.status)
                  }}
                >
                  {order.status}
                </div>
                <div style={styles.orderTotal}>
                  ৳{order.total}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <p>No orders yet</p>
            <Link to="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Start browsing restaurants
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;

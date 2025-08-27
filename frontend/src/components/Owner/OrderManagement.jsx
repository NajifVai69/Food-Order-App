import React, { useState, useEffect } from 'react';
import api from '../../api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useUser } from '../../context/UserContext';

const OrderManagement = () => {
  // 1) Always call hooks at the top, unconditionally
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // 2) Single useEffect, unconditionally declared
  useEffect(() => {
    // Inside effect, check if owner before fetching
    if (user?.userType === 'Owner') {
      fetchOwnerOrders();
    } else {
      // If not owner, clear orders and loading
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchOwnerOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/owner');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch owner orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
    
      
      console.log(`✅ Order ${orderId} updated to ${newStatus} - Customer notification sent!`);
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #22c55e; color: white; padding: 1rem 1.5rem;
        border-radius: 0.5rem; font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      successMsg.textContent = `Order updated to ${newStatus} - Customer notified! 🔔`;
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        document.body.removeChild(successMsg);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#22c55e';
      case 'Paid': return '#3b82f6';
      case 'Cancelled': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      'Pending': ['Paid', 'Cancelled'],
      'Paid': ['Delivered', 'Cancelled'],
      'Delivered': [],
      'Cancelled': []
    };
    return statusFlow[currentStatus] || [];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  if (loading) return <LoadingSpinner />;

  const styles = {
    container: {
      padding: '1.5rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#111',
      margin: 0
    },
    statsBar: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      minWidth: '120px'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#111',
      margin: '0 0 0.25rem 0'
    },
    statLabel: {
      fontSize: '0.8rem',
      color: '#6b7280',
      margin: 0
    },
    tabsContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      borderBottom: '2px solid #f3f4f6'
    },
    tab: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0.5rem 0.5rem 0 0',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    activeTab: {
      backgroundColor: 'white',
      color: '#3b82f6',
      borderBottom: '2px solid #3b82f6',
      fontWeight: '600'
    },
    orderCard: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    orderId: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#111'
    },
    currentStatus: {
      padding: '0.5rem 1rem',
      borderRadius: '1rem',
      fontSize: '0.9rem',
      fontWeight: '500',
      color: 'white'
    },
    orderDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    detailGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    label: {
      fontSize: '0.8rem',
      color: '#6b7280',
      fontWeight: '500'
    },
    value: {
      fontSize: '0.95rem',
      color: '#111',
      fontWeight: '500'
    },
    statusControls: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem'
    },
    statusButton: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#6b7280'
    }
  };

  const [activeTab, setActiveTab] = useState('all');

  const filterOrdersByTab = () => {
    switch (activeTab) {
      case 'pending': return getOrdersByStatus('Pending');
      case 'paid': return getOrdersByStatus('Paid');
      case 'delivered': return getOrdersByStatus('Delivered');
      case 'cancelled': return getOrdersByStatus('Cancelled');
      default: return orders;
    }
  };

  const filteredOrders = filterOrdersByTab();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📋 My Restaurant Orders</h2>
        <button 
          onClick={fetchOwnerOrders}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{orders.length}</div>
          <div style={styles.statLabel}>Total Orders</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{getOrdersByStatus('Pending').length}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{getOrdersByStatus('Paid').length}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{getOrdersByStatus('Delivered').length}</div>
          <div style={styles.statLabel}>Delivered</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {[
          { id: 'all', label: 'All Orders', count: orders.length },
          { id: 'pending', label: 'Pending', count: getOrdersByStatus('Pending').length },
          { id: 'paid', label: 'In Progress', count: getOrdersByStatus('Paid').length },
          { id: 'delivered', label: 'Delivered', count: getOrdersByStatus('Delivered').length },
          { id: 'cancelled', label: 'Cancelled', count: getOrdersByStatus('Cancelled').length }
        ].map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {activeTab === 'all' ? '📦' : '🔍'}
          </div>
          <p>
            {activeTab === 'all' 
              ? 'No orders found for your restaurants' 
              : `No ${activeTab} orders found`}
          </p>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div key={order._id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <div style={styles.orderId}>
                Order #{order._id.slice(-8).toUpperCase()}
              </div>
              <div 
                style={{
                  ...styles.currentStatus,
                  backgroundColor: getStatusColor(order.status)
                }}
              >
                {order.status}
              </div>
            </div>

            <div style={styles.orderDetails}>
              <div style={styles.detailGroup}>
                <div style={styles.label}>Customer</div>
                <div style={styles.value}>{order.customerName}</div>
              </div>
              
              <div style={styles.detailGroup}>
                <div style={styles.label}>Phone</div>
                <div style={styles.value}>{order.customerPhone}</div>
              </div>
              
              <div style={styles.detailGroup}>
                <div style={styles.label}>Total Amount</div>
                <div style={styles.value}>৳{order.total}</div>
              </div>
              
              <div style={styles.detailGroup}>
                <div style={styles.label}>Payment Method</div>
                <div style={styles.value}>{order.paymentMethod}</div>
              </div>
              
              <div style={styles.detailGroup}>
                <div style={styles.label}>Order Date</div>
                <div style={styles.value}>{formatDate(order.createdAt)}</div>
              </div>
            </div>

            {/* Status Update Controls */}
            {getStatusOptions(order.status).length > 0 && (
              <div style={styles.statusControls}>
                <strong style={{ color: '#374151' }}>Update Status:</strong>
                
                {getStatusOptions(order.status).map((status) => (
                  <button
                    key={status}
                    style={{
                      ...styles.statusButton,
                      backgroundColor: updating === order._id ? '#f3f4f6' : 'white',
                      cursor: updating === order._id ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => updateOrderStatus(order._id, status)}
                    disabled={updating === order._id}
                    onMouseEnter={(e) => {
                      if (updating !== order._id) {
                        e.target.style.backgroundColor = getStatusColor(status);
                        e.target.style.color = 'white';
                        e.target.style.borderColor = getStatusColor(status);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (updating !== order._id) {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#111';
                        e.target.style.borderColor = '#d1d5db';
                      }
                    }}
                  >
                    {updating === order._id ? 'Updating...' : `Mark as ${status}`}
                  </button>
                ))}
                
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: 'auto' }}>
                  📱 Customer gets notified automatically
                </div>
              </div>
            )}

            {/* Items List */}
            {order.items && order.items.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={styles.label}>Items:</div>
                <div style={{ marginTop: '0.5rem' }}>
                  {order.items.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      backgroundColor: '#f9fafb',
                      marginBottom: '0.25rem',
                      borderRadius: '0.25rem'
                    }}>
                      <span>{item.name} x{item.quantity}</span>
                      <span>৳{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default OrderManagement;

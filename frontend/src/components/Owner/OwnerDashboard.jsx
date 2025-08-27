import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantManagementApi } from '../../api';
import LoadingSpinner from '../common/LoadingSpinner';
import StarRating from '../common/StarRating';
import OrderManagement from './OrderManagement'; // ✅ ADD THIS IMPORT

const OwnerDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('restaurants'); // ✅ ADD TAB STATE

  useEffect(() => {
    fetchAssignedRestaurants();
  }, []);

  const fetchAssignedRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantManagementApi.getAssignedRestaurants();
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      setError('Failed to load assigned restaurants');
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // ✅ TAB STYLES
  const tabStyles = {
    tabContainer: {
      display: 'flex',
      borderBottom: '2px solid var(--color-secondary)',
      marginBottom: 'var(--space-24)'
    },
    tab: {
      padding: 'var(--space-12) var(--space-24)',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: 'var(--font-size-base)',
      fontWeight: 'var(--font-weight-medium)',
      color: 'var(--color-text-secondary)',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s ease'
    },
    activeTab: {
      color: 'var(--color-primary)',
      borderBottomColor: 'var(--color-primary)',
      fontWeight: 'var(--font-weight-semibold)'
    }
  };

  return (
    <div className="owner-dashboard" style={{ padding: 'var(--space-20)' }}>
      {/* ✅ DASHBOARD HEADER */}
      <div style={{ marginBottom: 'var(--space-24)' }}>
        <h2 style={{ margin: '0 0 var(--space-8) 0', color: 'var(--color-text)' }}>
          Owner Dashboard
        </h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
          Manage your restaurants and orders
        </p>
      </div>

      {/* ✅ TAB NAVIGATION */}
      <div style={tabStyles.tabContainer}>
        <button
          style={{
            ...tabStyles.tab,
            ...(activeTab === 'restaurants' ? tabStyles.activeTab : {})
          }}
          onClick={() => setActiveTab('restaurants')}
        >
          🏪 My Restaurants ({restaurants.length})
        </button>
        <button
          style={{
            ...tabStyles.tab,
            ...(activeTab === 'orders' ? tabStyles.activeTab : {})
          }}
          onClick={() => setActiveTab('orders')}
        >
          📋 Order Management
        </button>
      </div>

      {/* ✅ TAB CONTENT */}
      {activeTab === 'restaurants' && (
        <div>
          {error && (
            <div className="card" style={{ marginBottom: 'var(--space-20)' }}>
              <div className="card__body">
                <p style={{ color: 'var(--color-error)', margin: 0 }}>{error}</p>
              </div>
            </div>
          )}

          {restaurants.length === 0 ? (
            <div className="card">
              <div className="card__body" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-16)' }}>🏪</div>
                <h3>No Restaurants Assigned</h3>
                <p>You haven't been assigned to manage any restaurants yet.</p>
                <p>Contact your admin to get assigned to restaurants.</p>
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 'var(--space-20)'
            }}>
              {restaurants.map(restaurant => (
                <div key={restaurant._id} className="card">
                  <div className="card__body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-12)' }}>
                      <h3 style={{ margin: 0, color: 'var(--color-text)' }}>
                        {restaurant.name}
                      </h3>
                      <div className={`status ${restaurant.isAvailable ? 'status--success' : 'status--error'}`}>
                        {restaurant.isAvailable ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    {restaurant.description && (
                      <p style={{ 
                        color: 'var(--color-text-secondary)', 
                        fontSize: 'var(--font-size-sm)',
                        marginBottom: 'var(--space-12)'
                      }}>
                        {restaurant.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-16)' }}>
                      <StarRating rating={restaurant.averageRating || 0} readOnly size="sm" />
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        ({restaurant.totalRatings || 0} reviews)
                      </span>
                      <span style={{ 
                        background: 'var(--color-secondary)', 
                        padding: 'var(--space-4) var(--space-8)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)'
                      }}>
                        {restaurant.cuisineType}
                      </span>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: 'var(--space-12)',
                      marginBottom: 'var(--space-16)',
                      padding: 'var(--space-12)',
                      background: 'var(--color-secondary)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      <div>
                        <div style={{ color: 'var(--color-text-secondary)' }}>Menu Items</div>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          {restaurant.menuItems?.length || 0} items
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--color-text-secondary)' }}>Delivery</div>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          {restaurant.estimatedDeliveryTime?.min || 30}-{restaurant.estimatedDeliveryTime?.max || 45} mins
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--color-text-secondary)' }}>Location</div>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          {restaurant.location?.area}, {restaurant.location?.city}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--color-text-secondary)' }}>Delivery Fee</div>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          ৳{restaurant.deliveryFee || 60}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                      <Link 
                        to={`/owner/restaurant/${restaurant._id}/menu`}
                        className="btn-primary"
                        style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                      >
                        Manage Menu
                      </Link>
                      <Link 
                        to={`/owner/restaurant/${restaurant._id}/settings`}
                        className="btn-secondary"
                        style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                      >
                        Settings
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ ORDER MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <div>
          <OrderManagement />
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
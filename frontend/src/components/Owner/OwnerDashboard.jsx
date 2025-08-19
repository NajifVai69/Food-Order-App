import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantManagementApi } from '../../api';
import LoadingSpinner from '../common/LoadingSpinner';
import StarRating from '../common/StarRating';

const OwnerDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="owner-dashboard" style={{ padding: 'var(--space-20)' }}>
      <h2 style={{ margin: '0 0 var(--space-24) 0', color: 'var(--color-text)' }}>
        My Restaurants
      </h2>

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
  );
};

export default OwnerDashboard;

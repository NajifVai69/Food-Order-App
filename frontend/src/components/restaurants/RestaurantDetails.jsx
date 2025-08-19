import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { restaurantApi } from '../../api';
import { useUser } from '../../context/UserContext';
import StarRating from '../common/StarRating';
import RatingSystem from './RatingSystem';
import LoadingSpinner from '../common/LoadingSpinner';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const response = await restaurantApi.getRestaurantDetails(id);
      setRestaurant(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingUpdate = (newRatingData) => {
    if (restaurant) {
      setRestaurant({
        ...restaurant,
        restaurant: {
          ...restaurant.restaurant,
          averageRating: newRatingData.averageRating,
          totalRatings: newRatingData.totalRatings
        }
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="dashboard-bg">
        <div className="dashboard-card">
          <h2>Error</h2>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-16)' }}>{error}</p>
          <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const { restaurant: restaurantInfo, menuItems, recentRatings } = restaurant;
  const categories = Object.keys(menuItems);

  return (
    <div className="restaurant-details" style={{ 
      minHeight: '100vh', 
      background: 'var(--color-bg-1)', 
      paddingTop: '100px',
      paddingBottom: 'var(--space-32)'
    }}>
      <div className="container">
        {/* Header */}
        <div className="restaurant-header card" style={{ marginBottom: 'var(--space-24)' }}>
          <div className="card__body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-16)' }}>
              <button 
                onClick={() => navigate(-1)} 
                className="btn-secondary"
                style={{ padding: 'var(--space-8) var(--space-12)', fontSize: 'var(--font-size-sm)' }}
              >
                ← Back
              </button>
              
              <div className={`status ${restaurantInfo.isAvailable ? 'status--success' : 'status--error'}`}>
                {restaurantInfo.isOpen ? (restaurantInfo.isAvailable ? 'Open' : 'Closed') : 'Closed'}
              </div>
            </div>

            <h1 style={{ margin: '0 0 var(--space-8) 0', color: 'var(--color-text)' }}>
              {restaurantInfo.name}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)', marginBottom: 'var(--space-16)' }}>
              <StarRating rating={restaurantInfo.averageRating} readOnly />
              <span style={{ color: 'var(--color-text-secondary)' }}>
                ({restaurantInfo.totalRatings} review{restaurantInfo.totalRatings !== 1 ? 's' : ''})
              </span>
              <span style={{ 
                background: 'var(--color-secondary)', 
                padding: 'var(--space-4) var(--space-8)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text)'
              }}>
                {restaurantInfo.cuisineType}
              </span>
            </div>

            {restaurantInfo.restaurantDescription && (
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-16)' }}>
                {restaurantInfo.restaurantDescription}
              </p>
            )}

            {/* Restaurant Info Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--space-16)',
              padding: 'var(--space-16)',
              background: 'var(--color-secondary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Delivery Time
                </div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                  {restaurantInfo.estimatedDeliveryTime?.min}-{restaurantInfo.estimatedDeliveryTime?.max} mins
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Delivery Fee
                </div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                  ৳{restaurantInfo.deliveryFee}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Minimum Order
                </div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                  ৳{restaurantInfo.minOrderAmount}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Location
                </div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                  {restaurantInfo.location?.area}, {restaurantInfo.location?.city}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="menu-section">
          <div className="card" style={{ marginBottom: 'var(--space-24)' }}>
            <div className="card__body">
              <h2 style={{ margin: '0 0 var(--space-20) 0' }}>Menu</h2>
              
              {categories.length > 1 && (
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--space-8)', 
                  marginBottom: 'var(--space-20)',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    className={`btn-secondary ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                    style={{
                      backgroundColor: selectedCategory === 'all' ? 'var(--color-primary)' : 'var(--color-secondary)',
                      color: selectedCategory === 'all' ? 'var(--color-btn-primary-text)' : 'var(--color-text)'
                    }}
                  >
                    All Items
                  </button>
                  {categories.map(category => (
                    <button 
                      key={category}
                      className={`btn-secondary ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        backgroundColor: selectedCategory === category ? 'var(--color-primary)' : 'var(--color-secondary)',
                        color: selectedCategory === category ? 'var(--color-btn-primary-text)' : 'var(--color-text)'
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {categories.length === 0 ? (
                <p style={{ 
                  textAlign: 'center', 
                  color: 'var(--color-text-secondary)', 
                  fontStyle: 'italic',
                  padding: 'var(--space-32)'
                }}>
                  No menu items available
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                  {categories
                    .filter(category => selectedCategory === 'all' || selectedCategory === category)
                    .map(category => (
                      <div key={category}>
                        {(selectedCategory === 'all' && categories.length > 1) && (
                          <h3 style={{ 
                            margin: '0 0 var(--space-12) 0',
                            color: 'var(--color-primary)',
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-semibold)'
                          }}>
                            {category}
                          </h3>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                          {menuItems[category].map(item => (
                            <div 
                              key={item._id} 
                              className="menu-item-card"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                padding: 'var(--space-16)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-surface)'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-8)' }}>
                                  <h4 style={{ margin: 0, color: 'var(--color-text)' }}>{item.name}</h4>
                                  <div className={`availability-badge ${item.isAvailable ? 'available' : 'unavailable'}`}>
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                  </div>
                                </div>
                                <p style={{ 
                                  margin: '0 0 var(--space-8) 0', 
                                  color: 'var(--color-text-secondary)',
                                  fontSize: 'var(--font-size-sm)'
                                }}>
                                  {item.description}
                                </p>
                                <div style={{ 
                                  fontSize: 'var(--font-size-lg)', 
                                  fontWeight: 'var(--font-weight-bold)',
                                  color: 'var(--color-success)'
                                }}>
                                  ৳{item.price}
                                </div>
                              </div>
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: 'var(--radius-base)',
                                    marginLeft: 'var(--space-16)'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating System */}
        <div className="rating-section card" style={{ marginBottom: 'var(--space-24)' }}>
          <div className="card__body">
            <RatingSystem 
              restaurantId={id} 
              onRatingSubmitted={handleRatingUpdate}
            />
          </div>
        </div>

        {/* Recent Reviews */}
        {recentRatings && recentRatings.length > 0 && (
          <div className="reviews-section card">
            <div className="card__body">
              <h3 style={{ margin: '0 0 var(--space-20) 0' }}>Recent Reviews</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                {recentRatings.map(review => (
                  <div 
                    key={review._id}
                    style={{
                      padding: 'var(--space-16)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-secondary)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                        <StarRating rating={review.rating} readOnly size="sm" />
                        <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                          {review.userName}
                        </span>
                      </div>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.review && (
                      <p style={{ margin: '0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        {review.review}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;

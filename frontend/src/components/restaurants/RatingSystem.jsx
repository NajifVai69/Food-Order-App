import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { restaurantApi } from '../../api';
import StarRating from '../common/StarRating';

const RatingSystem = ({ restaurantId, onRatingSubmitted }) => {
  const { user } = useUser();
  const [userRating, setUserRating] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    rating: 0,
    review: '',
    orderExperience: {
      foodQuality: 0,
      deliveryTime: 0,
      packaging: 0
    }
  });

  useEffect(() => {
    if (user && restaurantId) {
      fetchUserRating();
    }
  }, [user, restaurantId]);

  const fetchUserRating = async () => {
    try {
      const response = await restaurantApi.getUserRating(restaurantId);
      if (response.data.hasRated) {
        setUserRating(response.data.rating);
        setFormData({
          rating: response.data.rating.rating,
          review: response.data.rating.review || '',
          orderExperience: response.data.rating.orderExperience || {
            foodQuality: 0,
            deliveryTime: 0,
            packaging: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage('Please login to rate this restaurant');
      return;
    }

    if (formData.rating === 0) {
      setMessage('Please select a rating');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await restaurantApi.submitRating(restaurantId, formData);
      setMessage(userRating ? 'Rating updated successfully!' : 'Rating submitted successfully!');
      setUserRating(response.data.rating);
      setShowForm(false);
      
      if (onRatingSubmitted) {
        onRatingSubmitted(response.data.restaurantRating);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error submitting rating');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userRating) return;
    
    setLoading(true);
    try {
      const response = await restaurantApi.deleteRating(restaurantId);
      setMessage('Rating deleted successfully');
      setUserRating(null);
      setFormData({
        rating: 0,
        review: '',
        orderExperience: { foodQuality: 0, deliveryTime: 0, packaging: 0 }
      });
      
      if (onRatingSubmitted) {
        onRatingSubmitted(response.data.restaurantRating);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error deleting rating');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="rating-system">
        <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          Login to rate this restaurant
        </p>
      </div>
    );
  }

  return (
    <div className="rating-system">
      <div className="rating-header">
        <h4 style={{ margin: 0, color: 'var(--color-text)', fontSize: 'var(--font-size-lg)' }}>
          Your Rating
        </h4>
        
        {userRating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
            <StarRating rating={userRating.rating} readOnly />
            <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowForm(true)}
                style={{ padding: 'var(--space-8) var(--space-12)', fontSize: 'var(--font-size-sm)' }}
              >
                Edit
              </button>
              <button 
                className="btn-danger" 
                onClick={handleDelete}
                disabled={loading}
                style={{ padding: 'var(--space-8) var(--space-12)', fontSize: 'var(--font-size-sm)' }}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(true)}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-sm)' }}
          >
            Rate Restaurant
          </button>
        )}
      </div>

      {userRating && userRating.review && (
        <div style={{ 
          marginTop: 'var(--space-12)', 
          padding: 'var(--space-12)', 
          background: 'var(--color-secondary)',
          borderRadius: 'var(--radius-base)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text)'
        }}>
          "{userRating.review}"
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && setShowForm(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h4>{userRating ? 'Update Rating' : 'Rate Restaurant'}</h4>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="rating-form" style={{ padding: 'var(--space-20)' }}>
              <div className="form-group">
                <label>Overall Rating *</label>
                <StarRating 
                  rating={formData.rating} 
                  onRatingChange={(rating) => setFormData({...formData, rating})}
                  size="lg"
                />
              </div>

              <div className="form-group">
                <label>Review (optional)</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Share your experience..."
                  value={formData.review}
                  onChange={(e) => setFormData({...formData, review: e.target.value})}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 'var(--space-16)',
                marginTop: 'var(--space-16)'
              }}>
                <div className="form-group">
                  <label>Food Quality</label>
                  <StarRating 
                    rating={formData.orderExperience.foodQuality} 
                    onRatingChange={(rating) => setFormData({
                      ...formData, 
                      orderExperience: {...formData.orderExperience, foodQuality: rating}
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Time</label>
                  <StarRating 
                    rating={formData.orderExperience.deliveryTime} 
                    onRatingChange={(rating) => setFormData({
                      ...formData, 
                      orderExperience: {...formData.orderExperience, deliveryTime: rating}
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>Packaging</label>
                  <StarRating 
                    rating={formData.orderExperience.packaging} 
                    onRatingChange={(rating) => setFormData({
                      ...formData, 
                      orderExperience: {...formData.orderExperience, packaging: rating}
                    })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading || formData.rating === 0}
                >
                  {loading ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
                </button>
              </div>

              {message && (
                <div className={`message ${message.includes('Error') || message.includes('error') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingSystem;

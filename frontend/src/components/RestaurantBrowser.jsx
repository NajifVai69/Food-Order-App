import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import StarRating from './common/StarRating';

const cuisineTypes = [
  'Bengali',
  'Chinese', 
  'Indian',
  'Fast Food'
];

const RestaurantBrowser = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all restaurants on mount
  useEffect(() => {
    fetchAllRestaurants();
  }, []);

  const fetchAllRestaurants = async () => {
    setLoading(true);
    try {
      // Get all restaurants by calling with empty params
      const res = await api.get('/restaurants');
      setAllRestaurants(res.data.restaurants || []);
      setRestaurants(res.data.restaurants || []);
    } catch (err) {
      setAllRestaurants([]);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    // If no filters, show all
    if (!location && !cuisine && !availability) {
      setRestaurants(allRestaurants);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/restaurants', {
        params: {
          location,
          cuisine,
          availability
        }
      });
      setRestaurants(res.data.restaurants || []);
    } catch (err) {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const clearFilters = () => {
    setLocation('');
    setCuisine('');
    setAvailability('');
    setRestaurants(allRestaurants);
  };

  return (
    <div className="restaurant-browser" style={{ width: '100%' }}>
      <div className="card" style={{ marginBottom: 'var(--space-24)' }}>
        <div className="card__body">
          <h2 style={{ margin: '0 0 var(--space-20) 0' }}>Browse Restaurants</h2>
          
          <form className="restaurant-filter" onSubmit={handleFilter}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--space-12)',
              marginBottom: 'var(--space-16)'
            }}>
              <input
                type="text"
                className="form-control"
                placeholder="Location (city, area...)"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
              <select 
                className="form-control"
                value={cuisine} 
                onChange={e => setCuisine(e.target.value)}
              >
                <option value="">All Cuisines</option>
                {cuisineTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select 
                className="form-control"
                value={availability} 
                onChange={e => setAvailability(e.target.value)}
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
              <button type="submit" className="btn-primary">
                Filter
              </button>
              {(location || cuisine || availability) && (
                <button type="button" className="btn-secondary" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-32)' }}>
          <div className="loading-spinner"></div>
          <p>Loading restaurants...</p>
        </div>
      ) : (
        <div className="restaurant-list">
          {restaurants.length === 0 ? (
            <div className="card">
              <div className="card__body" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p>No restaurants found matching your criteria.</p>
                {(location || cuisine || availability) && (
                  <button className="btn-secondary" onClick={clearFilters}>
                    Show All Restaurants
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--space-16)'
            }}>
              {restaurants.map(restaurant => (
                <Link 
                  key={restaurant._id} 
                  to={`/restaurant/${restaurant._id}`}
                  className="restaurant-card card"
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    transition: 'transform var(--duration-fast) var(--ease-standard)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <div className="card__body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-12)' }}>
                      <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: 'var(--font-size-lg)' }}>
                        {restaurant.name}
                      </h3>
                      <div className={`status ${restaurant.isAvailable ? 'status--success' : 'status--error'}`}>
                        {restaurant.isAvailable ? 'Open' : 'Closed'}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
                      <StarRating rating={restaurant.averageRating || 0} readOnly size="sm" />
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        ({restaurant.totalRatings || 0} reviews)
                      </span>
                    </div>

                    <p style={{ 
                      margin: '0 0 var(--space-8) 0', 
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      📍 {restaurant.location?.area && `${restaurant.location.area}, `}{restaurant.location?.city}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ 
                        background: 'var(--color-secondary)', 
                        padding: 'var(--space-4) var(--space-8)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text)'
                      }}>
                        {restaurant.cuisineType}
                      </span>
                      
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        color: 'var(--color-text-secondary)',
                        textAlign: 'right'
                      }}>
                        <div>🕒 {restaurant.estimatedDeliveryTime?.min || 30}-{restaurant.estimatedDeliveryTime?.max || 45} mins</div>
                        <div>🚚 ৳{restaurant.deliveryFee || 60}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantBrowser;

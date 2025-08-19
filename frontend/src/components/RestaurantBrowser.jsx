import React, { useEffect, useState } from 'react';
import api from '../api';

const cuisineTypes = [
  'Bengali',
  'Chinese',
  'Indian',
  'Fast Food'
];

const RestaurantBrowser = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(false);

  // Only fetch when filter is applied
  useEffect(() => {
    // Do not fetch on mount
  }, []);

  const fetchRestaurants = async () => {
    // Only fetch if at least one filter is set
    if (!location && !cuisine && !availability) {
      setRestaurants([]);
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

  return (
    <div className="restaurant-browser">
      <h2>Browse Restaurants</h2>
      <form className="restaurant-filter" onSubmit={handleFilter}>
        <input
          type="text"
          placeholder="Location (city, area...)"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
        <select value={cuisine} onChange={e => setCuisine(e.target.value)}>
          <option value="">All Cuisines</option>
          {cuisineTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select value={availability} onChange={e => setAvailability(e.target.value)}>
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <button type="submit">Filter</button>
      </form>
      {loading ? (
        <p>Loading restaurants...</p>
      ) : (
        <div className="restaurant-list">
          {(!location && !cuisine && !availability) ? (
            <p>Use the filters above to browse restaurants by location, cuisine type, or availability.</p>
          ) : restaurants.length === 0 ? (
            <p>No restaurants found.</p>
          ) : (
            restaurants.map(r => (
              <div key={r._id} className="restaurant-card">
                <h3>{r.name}</h3>
                <p>{r.location?.city}{r.location?.area ? ', ' + r.location.area : ''}</p>
                <p>Cuisine: {r.cuisineType}</p>
                <p>Status: <span style={{color: r.isAvailable ? '#22c55e' : '#e11d48'}}>{r.isAvailable ? 'Available' : 'Unavailable'}</span></p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantBrowser;

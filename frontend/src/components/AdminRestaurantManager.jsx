import React, { useEffect, useState } from 'react';
import api from '../api';

const cuisineTypes = [
  'Bengali',
  'Chinese',
  'Indian',
  'Fast Food'
];

const AdminRestaurantManager = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: '', city: '', area: '', district: '', street: '', cuisineType: '', isAvailable: true });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
  const res = await api.get('/manage-restaurants');
  setRestaurants(res.data.restaurants || []);
    } catch (err) {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAdd = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/manage-restaurants', {
        name: form.name,
        cuisineType: form.cuisineType,
        isAvailable: form.isAvailable,
        location: {
          city: form.city,
          area: form.area,
          district: form.district,
          street: form.street
        }
      });
      setMessage(res.data.message);
  setForm({ name: '', city: '', area: '', district: '', street: '', cuisineType: '', isAvailable: true });
      fetchRestaurants();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    setLoading(true);
    setMessage('');
    try {
  await api.delete(`/manage-restaurants/${id}`);
  setMessage('Restaurant deleted successfully');
  fetchRestaurants();
    } catch (err) {
      setMessage('Failed to delete restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="admin-restaurant-manager">
      <form className="restaurant-form" onSubmit={handleAdd}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Restaurant Name" required />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
        <input name="area" value={form.area} onChange={handleChange} placeholder="Area" />
        <input name="district" value={form.district} onChange={handleChange} placeholder="District" />
        <input name="street" value={form.street} onChange={handleChange} placeholder="Street" />
        <select name="cuisineType" value={form.cuisineType} onChange={handleChange} required>
          <option value="">Select Cuisine Type</option>
          {cuisineTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <label style={{marginLeft: '1rem'}}>
          <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
          Available
        </label>
        <button type="submit" disabled={loading}>Add Restaurant</button>
      </form>
      {message && <p style={{marginTop: '1rem', color: message.toLowerCase().includes('success') ? '#22c55e' : '#e11d48'}}>{message}</p>}
      <div className="restaurant-list">
        {restaurants.length === 0 ? (
          <p>No restaurants found.</p>
        ) : (
          restaurants.map(r => (
            <div key={r._id} className="restaurant-card">
              <h3>{r.name}</h3>
              <p>{r.location?.city}, {r.location?.area}</p>
              <button onClick={() => handleDelete(r._id)} disabled={loading}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminRestaurantManager;

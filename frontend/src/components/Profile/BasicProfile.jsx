import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import api from '../../api';

const BasicProfile = () => {
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    preferredLanguage: user?.preferredLanguage || 'English',
    restaurantName: user?.restaurantName || '',
    restaurantDescription: user?.restaurantDescription || '',
    restaurantLocation: user?.restaurantLocation || {
      street: '',
      area: '',
      district: '',
      city: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested restaurantLocation fields
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        restaurantLocation: {
          ...prev.restaurantLocation,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updateData = { ...formData };
      
      // Remove empty restaurantLocation for non-owners
      if (user?.userType !== 'Owner') {
        delete updateData.restaurantName;
        delete updateData.restaurantDescription;
        delete updateData.restaurantLocation;
      }

      // Remove customer-specific fields for non-customers
      if (user?.userType !== 'Customer') {
        delete updateData.preferredLanguage;
      }

      const response = await api.put('/profile', updateData);
      updateUser(response.data.user);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <h3>Basic Information</h3>
      <form onSubmit={handleSubmit} className="profile-form">
        {/* Common Fields */}
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
          />
        </div>

        {/* Customer-specific fields */}
        {user?.userType === 'Customer' && (
          <div className="form-group">
            <label>Preferred Language</label>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
            >
              <option value="English">English</option>
              <option value="Bengali">Bengali</option>
            </select>
          </div>
        )}

        {/* Owner-specific fields */}
        {user?.userType === 'Owner' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Restaurant Name</label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  placeholder="Your restaurant name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Restaurant Description</label>
              <textarea
                name="restaurantDescription"
                value={formData.restaurantDescription}
                onChange={handleChange}
                placeholder="Describe your restaurant and cuisine"
                rows="3"
              />
            </div>

            <div className="form-section">
              <h4>Restaurant Location</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="location.street"
                    value={formData.restaurantLocation?.street || ''}
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                </div>
                
                <div className="form-group">
                  <label>Area</label>
                  <input
                    type="text"
                    name="location.area"
                    value={formData.restaurantLocation?.area || ''}
                    onChange={handleChange}
                    placeholder="Area/Locality"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>District</label>
                  <input
                    type="text"
                    name="location.district"
                    value={formData.restaurantLocation?.district || ''}
                    onChange={handleChange}
                    placeholder="District"
                  />
                </div>
                
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.restaurantLocation?.city || ''}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Updating...' : 'Update Profile'}
        </button>

        {message && (
          <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default BasicProfile;

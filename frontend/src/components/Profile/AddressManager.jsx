import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import api from '../../api';

const AddressManager = () => {
  const { user, fetchProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    area: '',
    district: '',
    city: '',
    isDefault: false
  });

  const resetForm = () => {
    setFormData({
      street: '',
      area: '',
      district: '',
      city: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdd = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEdit = (address) => {
    setFormData({
      street: address.street,
      area: address.area,
      district: address.district,
      city: address.city,
      isDefault: address.isDefault
    });
    setEditingAddress(address._id);
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (editingAddress) {
        // Update existing address
        await api.put(`/profile/addresses/${editingAddress}`, formData);
        setMessage('Address updated successfully!');
      } else {
        // Add new address
        await api.post('/profile/addresses', formData);
        setMessage('Address added successfully!');
      }
      
      // Refresh user data
      await fetchProfile();
      resetForm();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    setLoading(true);
    setMessage('');

    try {
      await api.delete(`/profile/addresses/${addressId}`);
      await fetchProfile();
      setMessage('Address deleted successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  if (user?.userType !== 'Customer') {
    return <div className="profile-section">This section is only available for customers.</div>;
  }

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Delivery Addresses</h3>
        <button onClick={handleAdd} className="btn-primary">
          Add New Address
        </button>
      </div>

      {/* Address List */}
      <div className="address-list">
        {user?.deliveryAddresses?.length === 0 ? (
          <p className="no-data">No addresses added yet. Add your first delivery address!</p>
        ) : (
          user?.deliveryAddresses?.map((address) => (
            <div key={address._id} className="address-card">
              <div className="address-info">
                <div className="address-header">
                  <span className="address-label">
                    {address.isDefault && <span className="default-badge">Default</span>}
                    Address
                  </span>
                </div>
                <div className="address-details">
                  <p>{address.street}</p>
                  <p>{address.area}, {address.district}</p>
                  <p>{address.city}</p>
                </div>
              </div>
              <div className="address-actions">
                <button 
                  onClick={() => handleEdit(address)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(address._id)}
                  className="btn-danger"
                  disabled={loading || user.deliveryAddresses.length === 1}
                  title={user.deliveryAddresses.length === 1 ? "Can't delete your only address" : ""}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{editingAddress ? 'Edit Address' : 'Add New Address'}</h4>
              <button onClick={resetForm} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="address-form">
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="House/building number, street name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Area *</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Area/Locality"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>District *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select District</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                  />
                  Set as default address
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : (editingAddress ? 'Update' : 'Add') + ' Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && (
        <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AddressManager;

import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import api from '../../api';

const MenuManager = () => {
  const { user, fetchProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isAvailable: true
  });

  const categories = [
    'Appetizer',
    'Main Course', 
    'Dessert',
    'Beverage',
    'Rice Items',
    'Bengali Special',
    'Chinese',
    'Indian',
    'Fast Food'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      isAvailable: true
    });
    setEditingItem(null);
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

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      isAvailable: item.isAvailable
    });
    setEditingItem(item._id);
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate price
    const price = parseFloat(formData.price);
    if (!price || price <= 0) {
      setMessage('Please enter a valid price greater than 0');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        price: price
      };

      if (editingItem) {
        // Update existing item
        await api.put(`/profile/menu-items/${editingItem}`, submitData);
        setMessage('Menu item updated successfully!');
      } else {
        // Add new item
        await api.post('/profile/menu-items', submitData);
        setMessage('Menu item added successfully!');
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

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    setLoading(true);
    setMessage('');

    try {
      await api.delete(`/profile/menu-items/${itemId}`);
      await fetchProfile();
      setMessage('Menu item deleted successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId, currentStatus) => {
    setLoading(true);
    try {
      await api.put(`/profile/menu-items/${itemId}`, {
        isAvailable: !currentStatus
      });
      await fetchProfile();
      setMessage(`Item ${!currentStatus ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update item status');
    } finally {
      setLoading(false);
    }
  };

  if (user?.userType !== 'Owner') {
    return <div className="profile-section">This section is only available for restaurant owners.</div>;
  }

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Menu Items</h3>
        <button onClick={handleAdd} className="btn-primary">
          Add New Item
        </button>
      </div>

      {/* Menu Items List */}
      <div className="menu-list">
        {user?.menuItems?.length === 0 ? (
          <p className="no-data">No menu items added yet. Start building your menu!</p>
        ) : (
          user?.menuItems?.map((item) => (
            <div key={item._id} className="menu-card">
              <div className="menu-item-info">
                <div className="item-header">
                  <h4 className="item-name">
                    {item.name}
                    <span className={`availability-badge ${item.isAvailable ? 'available' : 'unavailable'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </h4>
                  <span className="item-price">৳{item.price}</span>
                </div>
                
                <div className="item-details">
                  <p className="item-description">{item.description}</p>
                  <span className="item-category">{item.category}</span>
                </div>

                {item.image && (
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                )}
              </div>

              <div className="menu-actions">
                <button 
                  onClick={() => toggleAvailability(item._id, item.isAvailable)}
                  className={`btn-toggle ${item.isAvailable ? 'disable' : 'enable'}`}
                  disabled={loading}
                  title={`${item.isAvailable ? 'Disable' : 'Enable'} this item`}
                >
                  {item.isAvailable ? 'Disable' : 'Enable'}
                </button>
                
                <button 
                  onClick={() => handleEdit(item)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Edit
                </button>
                
                <button 
                  onClick={() => handleDelete(item._id)}
                  className="btn-danger"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h4>
              <button onClick={resetForm} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="menu-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Beef Biriyani"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price (৳) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your dish, ingredients, cooking style..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                  />
                  Item is available for orders
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : (editingItem ? 'Update' : 'Add') + ' Item'}
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

export default MenuManager;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { restaurantManagementApi } from '../../api';
import LoadingSpinner from '../common/LoadingSpinner';

const RestaurantMenuManager = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isAvailable: true,
    stock: ''
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

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const response = await restaurantManagementApi.getAssignedRestaurants();
      const targetRestaurant = response.data.restaurants.find(r => r._id === restaurantId);
      
      if (!targetRestaurant) {
        navigate('/dashboard');
        return;
      }
      
      setRestaurant(targetRestaurant);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      isAvailable: true,
      stock: ''
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const price = parseFloat(formData.price);
    if (!price || price <= 0) {
      setMessage('Please enter a valid price greater than 0');
      return;
    }

    try {
      const submitData = { ...formData, stock: parseInt(formData.stock) };
      if (editingItem) {
        await restaurantManagementApi.updateMenuItem(restaurantId, editingItem, submitData);
        setMessage('Menu item updated successfully!');
      } else {
        await restaurantManagementApi.addMenuItem(restaurantId, submitData);
        setMessage('Menu item added successfully!');
      }
      fetchRestaurantData();
      resetForm();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error saving menu item');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      isAvailable: item.isAvailable,
      stock: item.stock?.toString() || ''
    });
    setEditingItem(item._id);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await restaurantManagementApi.deleteMenuItem(restaurantId, itemId);
      setMessage('Menu item deleted successfully!');
      fetchRestaurantData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error deleting menu item');
    }
  };

  const toggleAvailability = async (itemId, currentStatus) => {
    try {
      await restaurantManagementApi.updateMenuItem(restaurantId, itemId, {
        isAvailable: !currentStatus
      });
      fetchRestaurantData();
      setMessage(`Item ${!currentStatus ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      setMessage('Error updating item status');
    }
  };


  if (loading) return <LoadingSpinner />;
  if (!restaurant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-1)' }}>
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <h2>Restaurant Not Found</h2>
          <p>The restaurant you are trying to manage was not found or you do not have access.</p>
          <a href="/dashboard" className="btn-primary">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-manager" style={{ 
      minHeight: '100vh', 
      background: 'var(--color-bg-1)', 
      paddingTop: '100px',
      paddingBottom: 'var(--space-32)'
    }}>
      <div className="container">
        {/* Header */}
        <div className="card" style={{ marginBottom: 'var(--space-24)' }}>
          <div className="card__body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
              <Link to="/dashboard" className="btn-secondary">
                ← Back to Dashboard
              </Link>
              <button 
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Menu Item
              </button>
            </div>
            
            <h1 style={{ margin: '0 0 var(--space-8) 0', color: 'var(--color-text)' }}>
              {restaurant.name} - Menu Management
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              Manage menu items for your restaurant
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="card">
          <div className="card__body">
            <h2 style={{ margin: '0 0 var(--space-20) 0' }}>
              Menu Items ({restaurant.menuItems?.length || 0})
            </h2>

            {restaurant.menuItems?.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: 'var(--color-text-secondary)', 
                padding: 'var(--space-32)'
              }}>
                <p>No menu items added yet. Start building your menu!</p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary"
                >
                  Add First Menu Item
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                {restaurant.menuItems.map(item => (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
                        <h4 style={{ margin: 0, color: 'var(--color-text)' }}>{item.name}</h4>
                        <span className={`availability-badge ${item.isAvailable ? 'available' : 'unavailable'}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                        <span style={{ 
                          background: 'var(--color-secondary)', 
                          padding: 'var(--space-4) var(--space-8)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-sm)'
                        }}>
                          {item.category}
                        </span>
                      </div>
                      
                      <p style={{ 
                        margin: '0 0 var(--space-8) 0', 
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)'
                      }}>
                        {item.description}
                      </p>
                      
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-12)',
                        fontSize: 'var(--font-size-lg)', 
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--color-success)'
                      }}>
                        <span>৳{item.price}</span>
                        <span style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'normal',
                          color: 'var(--color-text-secondary)'
                        }}>
                          Stock: {item.stock}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-8)', marginLeft: 'var(--space-16)' }}>
                      <button 
                        onClick={() => toggleAvailability(item._id, item.isAvailable)}
                        className={`btn-toggle ${item.isAvailable ? 'disable' : 'enable'}`}
                        title={`${item.isAvailable ? 'Disable' : 'Enable'} this item`}
                      >
                        {item.isAvailable ? 'Disable' : 'Enable'}
                      </button>
                      
                      <button 
                        onClick={() => handleEdit(item)}
                        className="btn-secondary"
                      >
                        Edit
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your dish, ingredients, cooking style..."
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock (Quantity Available) *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="e.g., 10"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Image URL (Optional)</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    />
                    Item is available for orders
                  </label>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>

                {message && (
                  <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                    {message}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenuManager;

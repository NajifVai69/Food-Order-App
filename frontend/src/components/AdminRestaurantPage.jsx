import React, { useEffect, useState } from "react";
import api, { getAllOwners, assignRestaurantOwner } from "../api";
import { useUser } from "../context/UserContext";

const AdminRestaurantPage = () => {
  const { user } = useUser();
  const [restaurants, setRestaurants] = useState([]);
  const [owners, setOwners] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [status, setStatus] = useState({});
  const [globalMessage, setGlobalMessage] = useState(null); // New global message state
  const [loading, setLoading] = useState(false);

  // Add restaurant form data
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    location: {
      street: "",
      area: "",
      district: "",
      city: ""
    },
    cuisineType: "",
    isAvailable: true
  });

  const cuisineTypes = ['Bengali', 'Chinese', 'Indian', 'Fast Food'];

  useEffect(() => {
    fetchRestaurants();
    fetchOwners();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get("/restaurants");
      setRestaurants(res.data.restaurants || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await getAllOwners();
      setOwners(res.data.owners || []);
    } catch (error) {
      console.error("Error fetching owners:", error);
      setOwners([]);
    }
  };

  // Add Restaurant Functions
  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    
    if (!newRestaurant.name || !newRestaurant.cuisineType || !newRestaurant.location.city) {
      setStatus({ addForm: { error: "Please fill in all required fields" } });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/restaurants", newRestaurant);
      setStatus({ addForm: { success: "Restaurant added successfully!" } });
      
      // Reset form
      setNewRestaurant({
        name: "",
        location: { street: "", area: "", district: "", city: "" },
        cuisineType: "",
        isAvailable: true
      });
      
      // Refresh restaurants list
      await fetchRestaurants();
      
      // Close form after success
      setTimeout(() => {
        setShowAddForm(false);
        setStatus({});
      }, 2000);

    } catch (error) {
      setStatus({ 
        addForm: { 
          error: error.response?.data?.message || "Error adding restaurant" 
        } 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setNewRestaurant(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setNewRestaurant(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Assign Owner Functions
  const handleStartAssign = (restaurantId) => {
    setAssigning(restaurantId);
    setSelectedOwner("");
    setGlobalMessage(null); // Clear any previous messages
  };

  const handleAssignOwner = async (restaurantId) => {
    if (!selectedOwner) {
      setGlobalMessage({ 
        type: 'error', 
        text: "Please select an owner" 
      });
      return;
    }

    try {
      await assignRestaurantOwner(restaurantId, selectedOwner);
      
      // Find restaurant name for better message
      const restaurant = restaurants.find(r => r._id === restaurantId);
      const restaurantName = restaurant?.name || "Restaurant";
      
      setGlobalMessage({ 
        type: 'success', 
        text: `Owner assigned successfully to ${restaurantName}!` 
      });
      
      setAssigning(null);
      fetchRestaurants();
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setGlobalMessage(null);
      }, 5000);

    } catch (err) {
      setGlobalMessage({ 
        type: 'error', 
        text: err.response?.data?.message || "Error assigning owner" 
      });
    }
  };

  const handleDeleteRestaurant = async (restaurantId, restaurantName) => {
    if (!window.confirm(`Are you sure you want to delete "${restaurantName}"?`)) {
      return;
    }

    try {
      await api.delete(`/restaurants/${restaurantId}`);
      setGlobalMessage({ 
        type: 'success', 
        text: `Restaurant "${restaurantName}" deleted successfully!` 
      });
      fetchRestaurants();
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setGlobalMessage(null);
      }, 5000);

    } catch (err) {
      setGlobalMessage({ 
        type: 'error', 
        text: err.response?.data?.message || "Error deleting restaurant" 
      });
    }
  };

  // Check if user is admin
  if (!user || user.userType !== 'Admin') {
    return (
      <div className="dashboard-bg">
        <div className="dashboard-card">
          <h2>Access Denied</h2>
          <p>Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-restaurant-page" style={{ 
      minHeight: '100vh', 
      background: 'var(--color-bg-1)', 
      paddingTop: '100px',
      paddingBottom: 'var(--space-32)'
    }}>
      <div className="container">
        {/* Header */}
        <div className="card" style={{ marginBottom: 'var(--space-24)' }}>
          <div className="card__body">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'var(--space-16)'
            }}>
              <h1 style={{ margin: 0, color: 'var(--color-text)' }}>
                Manage Restaurants
              </h1>
              <button 
                className="btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                + Add New Restaurant
              </button>
            </div>
            
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              Add new restaurants and assign owners to manage them.
            </p>
          </div>
        </div>

        {/* Add Restaurant Form Modal */}
        {showAddForm && (
          <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && setShowAddForm(false)}>
            <div className="modal-content large-modal">
              <div className="modal-header">
                <h4>Add New Restaurant</h4>
                <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
              </div>
              
              <form onSubmit={handleAddRestaurant} className="restaurant-form" style={{ padding: 'var(--space-20)' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Restaurant Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newRestaurant.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Dhaka Biriyani House"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Cuisine Type *</label>
                    <select
                      name="cuisineType"
                      value={newRestaurant.cuisineType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Cuisine</option>
                      {cuisineTypes.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Fields */}
                <div className="form-section">
                  <h4>Restaurant Location</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Street Address</label>
                      <input
                        type="text"
                        name="location.street"
                        value={newRestaurant.location.street}
                        onChange={handleInputChange}
                        placeholder="Street address"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Area</label>
                      <input
                        type="text"
                        name="location.area"
                        value={newRestaurant.location.area}
                        onChange={handleInputChange}
                        placeholder="Area/Locality"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>District</label>
                      <select
                        name="location.district"
                        value={newRestaurant.location.district}
                        onChange={handleInputChange}
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
                    
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="location.city"
                        value={newRestaurant.location.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={newRestaurant.isAvailable}
                      onChange={handleInputChange}
                    />
                    Restaurant is available for orders
                  </label>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowAddForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Restaurant'}
                  </button>
                </div>

                {status.addForm?.success && (
                  <div className="message success">{status.addForm.success}</div>
                )}
                {status.addForm?.error && (
                  <div className="message error">{status.addForm.error}</div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Restaurants List */}
        <div className="card">
          <div className="card__body">
            <h3 style={{ margin: '0 0 var(--space-20) 0' }}>
              All Restaurants ({restaurants.length})
            </h3>
            
            {restaurants.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: 'var(--space-32)', 
                color: 'var(--color-text-secondary)' 
              }}>
                <p>No restaurants found. Add your first restaurant!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Cuisine</th>
                      <th>Location</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((restaurant) => {
                      const currentlyAssigning = assigning === restaurant._id;
                      
                      return (
                        <tr key={restaurant._id}>
                          <td>
                            <strong>{restaurant.name}</strong>
                            {restaurant.averageRating > 0 && (
                              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                ⭐ {restaurant.averageRating.toFixed(1)} ({restaurant.totalRatings} reviews)
                              </div>
                            )}
                          </td>
                          <td>{restaurant.cuisineType}</td>
                          <td>
                            {restaurant.location?.area && `${restaurant.location.area}, `}
                            {restaurant.location?.city}
                          </td>
                          <td>
                            {restaurant.owner ? (
                              <span style={{ color: 'var(--color-success)' }}>
                                {restaurant.owner.name || restaurant.owner.email}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--color-warning)' }}>
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td>
                            <div className={`status ${restaurant.isAvailable ? 'status--success' : 'status--error'}`}>
                              {restaurant.isAvailable ? 'Available' : 'Unavailable'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
                              {!restaurant.owner ? (
                                currentlyAssigning ? (
                                  <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
                                    <select
                                      className="form-control"
                                      value={selectedOwner}
                                      onChange={(e) => setSelectedOwner(e.target.value)}
                                      style={{ minWidth: '150px' }}
                                    >
                                      <option value="">Select Owner</option>
                                      {owners.map((owner) => (
                                        <option key={owner._id} value={owner._id}>
                                          {owner.name || owner.email}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      className="btn-primary"
                                      style={{ fontSize: 'var(--font-size-sm)' }}
                                      onClick={() => handleAssignOwner(restaurant._id)}
                                    >
                                      Assign
                                    </button>
                                    <button
                                      className="btn-secondary"
                                      style={{ fontSize: 'var(--font-size-sm)' }}
                                      onClick={() => setAssigning(null)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn-outline"
                                    style={{ fontSize: 'var(--font-size-sm)' }}
                                    onClick={() => handleStartAssign(restaurant._id)}
                                  >
                                    Assign Owner
                                  </button>
                                )
                              ) : (
                                <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>
                                  ✓ Assigned
                                </span>
                              )}
                              
                              <button
                                className="btn-danger"
                                style={{ fontSize: 'var(--font-size-sm)' }}
                                onClick={() => handleDeleteRestaurant(restaurant._id, restaurant.name)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Global Message Area - This will show success/error messages at the bottom */}
        {globalMessage && (
          <div 
            className={`card ${globalMessage.type === 'success' ? 'success-message' : 'error-message'}`}
            style={{ 
              marginTop: 'var(--space-24)',
              border: globalMessage.type === 'success' 
                ? '2px solid var(--color-success)' 
                : '2px solid var(--color-error)',
              backgroundColor: globalMessage.type === 'success'
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(239, 68, 68, 0.1)'
            }}
          >
            <div className="card__body">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-12)',
                color: globalMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)'
              }}>
                <span style={{ fontSize: 'var(--font-size-xl)' }}>
                  {globalMessage.type === 'success' ? '✅' : '❌'}
                </span>
                {globalMessage.text}
                <button 
                  onClick={() => setGlobalMessage(null)}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    fontSize: 'var(--font-size-xl)',
                    cursor: 'pointer',
                    color: 'inherit'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurantPage;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import LoadingSpinner from './common/LoadingSpinner';
import RestaurantBrowser from './RestaurantBrowser';
import Cart from './Cart';
import AdminRestaurantManager from './AdminRestaurantManager';
import OwnerDashboard from './Owner/OwnerDashboard';
import CustomerDashboard from './CustomerDashboard'; // ✅ ADD THIS
import NotificationBell from './notifications/NotificationBell'; // ✅ ADD THIS

const Dashboard = () => {
  const { user, loading, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="dashboard-bg">
        <div className="dashboard-card">
          <h2>Access Denied</h2>
          <p>Please log in to access the dashboard.</p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-bg">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {user.name || user.userType}! 👋</h1>
            <p className="user-type-badge">{user.userType} Dashboard</p>
          </div>
          
          <div className="user-actions">
            {/* ✅ ADD NOTIFICATION BELL FOR CUSTOMERS */}
            {user.userType === 'Customer' && <NotificationBell />}
            
            <Link to="/profile" className="btn-primary">
              My Profile
            </Link>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {/* ✅ ADD CUSTOMER DASHBOARD */}
          {user.userType === 'Customer' && <CustomerDashboard />}
          
          <p>You are now logged in to the Food Ordering Application. Here you can manage your food orders and account.</p>
          
          {/* Rest of your existing dashboard content... */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-grid">
              <Link to="/profile" className="action-card">
                <div className="action-icon">👤</div>
                <div className="action-info">
                  <h4>Manage Profile</h4>
                  <p>Update your personal information</p>
                </div>
              </Link>

              {user.userType === 'Customer' && (
                <>
                  <Link to="/profile" className="action-card">
                    <div className="action-icon">📍</div>
                    <div className="action-info">
                      <h4>Delivery Addresses</h4>
                      <p>Manage your delivery locations</p>
                    </div>
                  </Link>
                  
                  <div style={{width: '100%'}}>
                    <RestaurantBrowser />
                    <Cart />
                  </div>
                </>
              )}

              {user.userType === 'Owner' && (
                <>
                  <Link to="/profile" className="action-card">
                    <div className="action-icon">🍽️</div>
                    <div className="action-info">
                      <h4>Manage Menu</h4>
                      <p>Add and update your menu items</p>
                    </div>
                  </Link>
                  
                  <div>
                    <OwnerDashboard/>
                  </div>
                </>
              )}

              {user.userType === 'Admin' && (
                <>
                  <Link to="/manage-restaurants" className="action-card">
                    <div className="action-icon">🏪</div>
                    <div className="action-info">
                      <h4>Manage Restaurants</h4>
                      <p>Add or delete restaurants and set their location</p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Profile Completion Reminder - Your existing code */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

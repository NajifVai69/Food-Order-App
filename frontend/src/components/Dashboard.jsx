import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import LoadingSpinner from './common/LoadingSpinner';

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
            <Link to="/profile" className="btn-primary">
              My Profile
            </Link>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          <p>You are now logged in to the Food Ordering Application. Here you can manage your food orders and account.</p>
          
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
                  
                  <div className="action-card disabled">
                    <div className="action-icon">🛒</div>
                    <div className="action-info">
                      <h4>Browse Restaurants</h4>
                      <p>Find and order from local restaurants</p>
                      <span className="coming-soon">Coming Soon</span>
                    </div>
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
                  
                  <div className="action-card disabled">
                    <div className="action-icon">📊</div>
                    <div className="action-info">
                      <h4>Orders & Analytics</h4>
                      <p>View incoming orders and statistics</p>
                      <span className="coming-soon">Coming Soon</span>
                    </div>
                  </div>
                </>
              )}

              {user.userType === 'Admin' && (
                <>
                  <div className="action-card disabled">
                    <div className="action-icon">🏪</div>
                    <div className="action-info">
                      <h4>Manage Restaurants</h4>
                      <p>Oversee all restaurant operations</p>
                      <span className="coming-soon">Coming Soon</span>
                    </div>
                  </div>
                  
                  <div className="action-card disabled">
                    <div className="action-icon">👥</div>
                    <div className="action-info">
                      <h4>User Management</h4>
                      <p>Manage customers and owners</p>
                      <span className="coming-soon">Coming Soon</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Profile Completion Reminder */}
          {(!user.name || (user.userType === 'Customer' && user.deliveryAddresses?.length === 0) || 
            (user.userType === 'Owner' && (!user.restaurantName || user.menuItems?.length === 0))) && (
            <div className="profile-reminder">
              <h3>⚠️ Complete Your Profile</h3>
              <p>Your profile is incomplete. Complete it to get the most out of our platform:</p>
              <ul>
                {!user.name && <li>Add your full name</li>}
                {user.userType === 'Customer' && user.deliveryAddresses?.length === 0 && (
                  <li>Add at least one delivery address</li>
                )}
                {user.userType === 'Owner' && !user.restaurantName && (
                  <li>Add your restaurant name and description</li>
                )}
                {user.userType === 'Owner' && user.menuItems?.length === 0 && (
                  <li>Add menu items to your restaurant</li>
                )}
              </ul>
              <Link to="/profile" className="btn-primary">Complete Profile</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

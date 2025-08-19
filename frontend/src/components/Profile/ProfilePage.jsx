import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ProfileNav from './ProfileNav';
import BasicProfile from './BasicProfile'
import AddressManager from './AddressManager';
import MenuManager from './MenuManager';
import ActivityLogs from './ActivityLogs';
import AccountSettings from './AccountSettings';

const ProfilePage = () => {
  const { user, loading, logout } = useUser();
  const [activeTab, setActiveTab] = useState('basic');
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
      <div className="profile-container">
        <div className="profile-card">
          <h2>Access Denied</h2>
          <p>Please log in to view your profile.</p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicProfile />;
      case 'addresses':
        return <AddressManager />;
      case 'menu':
        return <MenuManager />;
      case 'activity':
        return <ActivityLogs />;
      case 'settings':
        return <AccountSettings />;
      default:
        return <BasicProfile />;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="user-info">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : user.userType.charAt(0)}
            </div>
            <div className="user-details">
              <h1>{user.name || 'User'}</h1>
              <p className="user-type">{user.userType}</p>
              <p className="user-contact">
                {user.email && <span>📧 {user.email}</span>}
                {user.phone && <span>📱 {user.phone}</span>}
              </p>
              <div className="verification-status">
                {user.isPhoneVerified && <span className="verified">✅ Phone Verified</span>}
                {user.isEmailVerified && <span className="verified">✅ Email Verified</span>}
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <Link to="/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
            <button onClick={handleLogout} className="btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <ProfileNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
        />
        
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

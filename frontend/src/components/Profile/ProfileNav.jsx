import React from 'react';

const ProfileNav = ({ activeTab, setActiveTab, user }) => {
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    ...(user?.userType === 'Customer' ? [
      { id: 'addresses', label: 'Addresses', icon: '📍' }
    ] : []),
    ...(user?.userType === 'Owner' ? [
      { id: 'menu', label: 'Menu Items', icon: '🍽️' }
    ] : [])
  ];

  return (
    <div className="profile-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ProfileNav;

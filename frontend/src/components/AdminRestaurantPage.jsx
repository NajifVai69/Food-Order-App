import React from 'react';
import AdminRestaurantManager from './AdminRestaurantManager';

const AdminRestaurantPage = () => {
  return (
    <div className="admin-restaurant-page" style={{ maxHeight: '100vh', overflowY: 'auto', padding: '2rem' }}>
      <h1>Manage Restaurants</h1>
      <AdminRestaurantManager />
    </div>
  );
};

export default AdminRestaurantPage;

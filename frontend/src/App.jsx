import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/Profile/ProfilePage';
import AdminRestaurantPage from './components/AdminRestaurantPage';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Link to="/dashboard" className="brand-header" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          Food Order Application
        </Link>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/manage-restaurants" element={<AdminRestaurantPage />} />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;

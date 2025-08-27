import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/Profile/ProfilePage';
import AdminRestaurantPage from './components/AdminRestaurantPage';
import RestaurantDetails from './components/restaurants/RestaurantDetails';
import RestaurantMenuManager from './components/Owner/RestaurantMenuManager';
import CheckoutPage from './components/CheckoutPage';
import { NotificationProvider } from './context/NotificationContext';
const App = () => {
  return (
    <UserProvider>
      <CartProvider>
        <NotificationProvider>
          <Router>
            <Link to="/dashboard" className="brand-header" style={{ textDecoration: 'none', color: 'inherit' }}>
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
            
              {/* Restaurant routes */}
              <Route path="/restaurant/:id" element={<RestaurantDetails />} />
              <Route path='/checkout' element={<CheckoutPage/>}/>
            
              {/* Owner routes */}
              <Route path="/owner/restaurant/:restaurantId/menu" element={<RestaurantMenuManager />} />
            
              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>

        </NotificationProvider>
      </CartProvider>
    </UserProvider>
  );
};

export default App;

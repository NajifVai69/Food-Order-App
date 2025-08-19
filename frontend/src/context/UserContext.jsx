import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in and get profile
  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setUser(response.data.user);
    } catch (error) {
      console.log('User not authenticated:', error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Set user after successful login
  const setUserAfterLogin = (userData) => {
    setUser(userData);
    setLoading(false);
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout error:', error.message);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const value = {
    user,
    loading,
    updateUser,
    setUserAfterLogin,
    logout,
    fetchProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

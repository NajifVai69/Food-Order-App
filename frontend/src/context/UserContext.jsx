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
      console.log('User not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Logout user
  const logout = () => {
    const response =api.post('/auth/logout');
    setUser(null);
    setLoading(false);
    // Clear any stored tokens/cookies if needed
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const value = {
    user,
    loading,
    updateUser,
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

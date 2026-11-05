import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Set admin status from user field (fallback until backend endpoint is ready)
        setIsAdminUser(userData.field === 'admin');
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Check admin status from backend
  const checkAdminStatus = async () => {
    try {
      const response = await api.checkIsAdmin();
      // Backend returns: { flag: true/false }
      const isAdmin = response.flag === true;
      setIsAdminUser(isAdmin);
      return isAdmin;
    } catch (error) {
      // Fallback to field check from user data
      const isAdmin = user?.field === 'admin';
      setIsAdminUser(isAdmin);
      return isAdmin;
    }
  };

  // Signup function - matches backend: { email, team_name, password, year, difficulty }
  const signup = async (signupData) => {

    try {
      const response = await api.signup(signupData);
      
      // Backend returns: { user: { email, team_name, year, difficulty, field }, token }
      const userData = {
        email: response.user.email,
        team_name: response.user.team_name,
        year: response.user.year,
        difficulty: response.user.difficulty,
        field: response.user.field
      };
      console.log('status code', response.status);
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Set admin status based on field
      setIsAdminUser(userData.field === 'admin');
      
      return { success: true, user: userData };
    } catch (error) {
      console.log("status code", error.response?.status);
      // Extract backend error message from response
      console.log('Signup error:', error.response);
      const message = error.response?.data?.message || error.response?.data?.error || 'Signup failed. Please try again.';
      return { success: false, message };
    }
  };

  // Login function - matches backend: { team_name, password }
  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      
      // Backend returns: { user: { email, team_name, year, difficulty, field }, token }
      const userData = {
        email: response.user.email,
        team_name: response.user.team_name,
        year: response.user.year,
        difficulty: response.user.difficulty,
        field: response.user.field
      };
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Check admin status from backend
      await checkAdminStatus();
      
      return { success: true, user: userData };
    } catch (error) {
      // Extract backend error message from response
      const message = error.response?.data?.message || error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.logout();
      
      // Clear token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAdminUser(false);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      // Even if API call fails, clear local state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAdminUser(false);
      
      return { success: false, message: error.message };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return isAdminUser === true;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    isLoading,
    signup,
    login,
    logout,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and verify user on mount if token exists
  useEffect(() => {
    const bootstrapAuth = async () => {
      if (token) {
        try {
          const response = await API.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
            localStorage.setItem('user', JSON.stringify(response.data.data));
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          handleLogout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, [token]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: receivedToken, user: userObj } = response.data;
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(userObj));
        setToken(receivedToken);
        setUser(userObj);
        setLoading(false);
        return { success: true, user: userObj };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/auth/register', userData);
      if (response.data.success) {
        const { token: receivedToken, user: userObj } = response.data;
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(userObj));
        setToken(receivedToken);
        setUser(userObj);
        setLoading(false);
        return { success: true, user: userObj };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.warn('Logout endpoint call failed:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      // Handles multipart form data if profile image is included
      const config = {
        headers: {
          'Content-Type': profileData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      };
      const response = await API.put('/auth/profile', profileData, config);
      if (response.data.success) {
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setLoading(false);
        return { success: true, user: updatedUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      updateProfile,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

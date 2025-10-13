import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fixed API URL - remove the endpoint part
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Initialize axios with better configuration
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Axios global configuration
    axios.defaults.timeout = 10000;
    axios.defaults.withCredentials = true;
    
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await axios.get(`${API_URL}/user/verify`);
      if (response.status === 200) {
        setUser({
          token: token,
          ...response.data.user
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  };


  const register = async (userData) => {
  try {
    setError('');
    setLoading(true);
    const fullUrl = `${API_URL}/user/register`;
    console.log('➡️ Sending registration:', fullUrl, JSON.stringify(userData, null, 2));
    const response = await axios.post(fullUrl, userData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    console.log('✅ Registration response:', {
      status: response.status,
      data: JSON.stringify(response.data, null, 2),
    });
    if (response.status === 200 || response.status === 201) {
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Invalid response format: Missing token or user');
      }
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ token, ...user });
      return { success: true, message: 'Registration successful!' };
    }
    console.error('Unexpected status:', response.status, response.data);
    return { success: false, message: `Unexpected status code: ${response.status}` };
  } catch (error) {
    console.error('💥 Registration error:', {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : null,
    });
    let errorMessage = 'Registration failed. ';
    if (error.code === 'ERR_NETWORK') {
      errorMessage += 'Backend not reachable. Please ensure server is running on http://localhost:5000.';
    } else if (error.response) {
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'No response from server. Check if backend is running.';
    } else {
      errorMessage = error.message || 'An unexpected error occurred.';
    }
    setError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setLoading(false);
  }
};


  // Fixed login function to use real API
  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/user/login`, {
        email,
        password
      });
      
      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser({ token, ...user });
        
        return { success: true, message: 'Login successful!' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error) => {
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot connect to server. Please make sure the backend server is running on http://localhost:5000';
    }
    
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        return 'Invalid email or password.';
      } else if (error.response.status === 400) {
        return error.response.data?.message || 'Bad request. Please check your input.';
      } else if (error.response.status === 404) {
        return 'Server endpoint not found. Check your API routes.';
      } else if (error.response.status === 500) {
        return 'Server error. Please try again later.';
      }
      return error.response.data?.message || `Server error: ${error.response.status}`;
    } 
    
    if (error.request) {
      return 'No response from server. The server may be down.';
    }
    
    return error.message || 'An unexpected error occurred.';
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setError('');
    console.log('User logged out');
  };

  const clearMessages = () => {
    setError('');
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    clearMessages,
    isAuthenticated: !!user && !!user.token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
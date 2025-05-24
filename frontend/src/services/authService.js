import axios from 'axios';

// Use environment variables for API URL with fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://knowledgeconnectapp-backend.onrender.com/api';

// Set up axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// User cache to reduce API calls
let userCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        userCache = null; // Clear cache on authentication error
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to update the user cache
const updateUserCache = (user) => {
  userCache = user;
  lastFetchTime = Date.now();
  
  // Also trigger a custom event that components can listen for
  const event = new CustomEvent('user-updated', { detail: user });
  window.dispatchEvent(event);
  
  return user;
};

// Clear the cache
export const clearUserCache = () => {
  userCache = null;
  lastFetchTime = 0;
};

export const register = async (userData) => {
  try {
    const response = await axios.post('/users/register', userData);
    const { token, user } = response.data;
    
    if (!token || !user) {
      throw new Error('Invalid response from server');
    }

    localStorage.setItem('token', token);
    return updateUserCache(user);
  } catch (error) {
    if (error.response?.status === 409) {
      throw { error: 'Email already exists' };
    }
    throw {
      error: error.response?.data?.message || 'Registration failed',
      status: error.response?.status
    };
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post('/users/login', { email, password });
    const { token, user } = response.data;
    
    if (!token || !user) {
      throw new Error('Invalid response from server');
    }

    localStorage.setItem('token', token);
    return updateUserCache(user);
  } catch (error) {
    throw {
      error: error.response?.data?.message || 'Invalid login credentials',
      status: error.response?.status
    };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  clearUserCache();
  window.location.href = '/login';
};

export const getCurrentUser = async (forceRefresh = false) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      clearUserCache();
      return null;
    }

    // Use cached data if available and not expired
    const now = Date.now();
    if (!forceRefresh && userCache && (now - lastFetchTime < CACHE_DURATION)) {
      return userCache;
    }

    // Fetch fresh data
    const response = await axios.get('/users/profile');
    return updateUserCache(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      clearUserCache();
      return null;
    }
    throw {
      error: error.response?.data?.message || 'Failed to get user profile',
      status: error.response?.status
    };
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await axios.patch('/users/profile', userData);
    return updateUserCache(response.data);
  } catch (error) {
    throw {
      error: error.response?.data?.message || 'Failed to update profile',
      status: error.response?.status
    };
  }
}; 
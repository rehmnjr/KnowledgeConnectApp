/**
 * API Utilities for handling common tasks related to API requests
 */

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Handle API error responses
export const handleApiError = (error) => {
  // Handle token expiration
  if (error.response?.status === 401) {
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
  
  // Format error for consistent handling
  const formattedError = {
    message: error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred',
    status: error.response?.status || 500,
    data: error.response?.data || null
  };
  
  return Promise.reject(formattedError);
}; 
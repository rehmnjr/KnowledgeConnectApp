import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://knowledgeconnectapp-backend.onrender.com/api';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';


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


axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const createMeeting = async (meetingData) => {
  try {
    const response = await axios.post('/meetings', meetingData);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to create meeting',
      status: error.response?.status
    };
  }
};

export const getMeetings = async () => {
  try {
    const response = await axios.get('/meetings');
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to fetch meetings',
      status: error.response?.status
    };
  }
};

export const getMeetingById = async (meetingId) => {
  try {
    const response = await axios.get(`/meetings/${meetingId}`);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to fetch meeting',
      status: error.response?.status
    };
  }
};

export const updateMeeting = async (meetingId, meetingData) => {
  try {
    const response = await axios.put(`/meetings/${meetingId}`, meetingData);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to update meeting',
      status: error.response?.status
    };
  }
};

export const deleteMeeting = async (meetingId) => {
  try {
    const response = await axios.delete(`/meetings/${meetingId}`);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to delete meeting',
      status: error.response?.status
    };
  }
};

export const joinMeeting = async (meetingId) => {
  try {
    const response = await axios.post(`/meetings/${meetingId}/join`);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to join meeting',
      status: error.response?.status
    };
  }
};

export const leaveMeeting = async (meetingId) => {
  try {
    const response = await axios.post(`/meetings/${meetingId}/leave`);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to leave meeting',
      status: error.response?.status
    };
  }
};

export const updateMeetingStatus = async (id, status) => {
  try {
    const response = await axios.patch(`/meetings/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to update meeting status',
      status: error.response?.status
    };
  }
}; 
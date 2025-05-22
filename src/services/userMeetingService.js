import axios from 'axios';
import { handleApiError, setAuthToken, getToken } from './apiUtils';

// Set default baseURL
const API_URL = import.meta.env.VITE_API_URL || 'https://knowledgeconnectapp.onrender.com';

// Create axios instance
const userMeetingApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
userMeetingApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
userMeetingApi.interceptors.response.use(
  (response) => response,
  (error) => {
    return handleApiError(error);
  }
);

// Join a meeting
export const joinMeeting = async (meetingId) => {
  try {
    const response = await userMeetingApi.post(`/user-meetings/join/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error('Error joining meeting:', error);
    throw error;
  }
};

// Leave a meeting
export const leaveMeeting = async (meetingId) => {
  try {
    const response = await userMeetingApi.patch(`/user-meetings/leave/${meetingId}`, { status: 'left' });
    return response.data;
  } catch (error) {
    console.error('Error leaving meeting:', error);
    throw error;
  }
};

// Get all participants for a meeting
export const getMeetingUsers = async (meetingId) => {
  try {
    const response = await userMeetingApi.get(`/user-meetings/meeting/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meeting participants:', error);
    throw error;
  }
};

// Get all meetings for a user
export const getUserMeetings = async () => {
  try {
    const response = await userMeetingApi.get(`/user-meetings/user`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user meetings:', error);
    throw error;
  }
};

// Get meeting stats
export const getMeetingStats = async (meetingId) => {
  try {
    const response = await userMeetingApi.get(`/user-meetings/meetings/${meetingId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meeting stats:', error);
    throw error;
  }
};

// Get participant count for a meeting
export const getMeetingParticipantCount = async (meetingId) => {
  try {
    const response = await userMeetingApi.get(`/user-meetings/meetings/${meetingId}/count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching participant count:', error);
    throw error;
  }
};

// Add feedback for a meeting
export const addMeetingFeedback = async (meetingId, feedback) => {
  try {
    const response = await axios.patch(`/meetings/${meetingId}/leave`, {
      feedback: {
        rating: feedback.rating,
        comment: feedback.comment
      }
    });
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to add feedback',
      status: error.response?.status
    };
  }
};

// Delete all mappings for a meeting
export const deleteAllMeetingMappings = async (meetingId) => {
  try {
    const response = await userMeetingApi.delete(`/user-meetings/meeting/${meetingId}/all`);
    return response.data;
  } catch (error) {
    console.error('Error deleting meeting mappings:', error);
    throw error;
  }
};

export default {
  joinMeeting,
  leaveMeeting,
  getMeetingUsers,
  getUserMeetings
}; 
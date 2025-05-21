import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// We'll use the axios interceptors that are already configured in other services
// So we don't need to add token for each request manually

export const getTopics = async () => {
  try {
    const response = await axios.get('/topics');
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to fetch topics',
      status: error.response?.status
    };
  }
};

export const getTopicById = async (id) => {
  try {
    const response = await axios.get(`/topics/${id}`);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to fetch topic',
      status: error.response?.status
    };
  }
};

export const getUserTopics = async () => {
  try {
    const response = await axios.get('/topics/user');
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to fetch user topics',
      status: error.response?.status
    };
  }
};

export const createTopic = async (topicData) => {
  try {
    const response = await axios.post('/topics', topicData);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to create topic',
      status: error.response?.status
    };
  }
};

export const updateTopic = async (id, topicData) => {
  try {
    const response = await axios.patch(`/topics/${id}`, topicData);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to update topic',
      status: error.response?.status
    };
  }
};

export const deleteTopic = async (id) => {
  try {
    const response = await axios.delete(`/topics/${id}`);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to delete topic',
      status: error.response?.status
    };
  }
};

export const joinTopic = async (id) => {
  try {
    const response = await axios.post(`/topics/${id}/join`);
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.message || error.response?.data?.error || 'Failed to join topic',
      status: error.response?.status
    };
  }
}; 
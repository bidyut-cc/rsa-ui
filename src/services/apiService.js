import axios from 'axios';

// Set your base URL for the API
const API_BASE_URL = 'http://localhost:3001/api/';

const apiService = {
  get: async (endpoint, params = {}) => {
    try {
      const token = localStorage.getItem('token') ? localStorage.getItem('token') : null;
      const headers = token ? { token: `${token}` } : {};
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params, headers });
      return response.data;
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('token') ? localStorage.getItem('token') : null;
      const headers = token ? { token: `${token}` } : {};
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, { headers });
      return response.data;
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  },

  put: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('token') ? localStorage.getItem('token') : null;
      const headers = token ? { token: `${token}` } : {};
      
      const response = await axios.put(`${API_BASE_URL}${endpoint}`, data, { headers });
      return response.data;
    } catch (error) {
      console.error('PUT request error:', error);
      throw error;
    }
  },

  delete: async (endpoint, params = {}) => {
    try {
      const token = localStorage.getItem('token') ? localStorage.getItem('token') : null;
      const headers = token ? { token: `${token}` } : {};
      
      const response = await axios.delete(`${API_BASE_URL}${endpoint}`, { params, headers });
      return response.data;
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  },
};

export default apiService;
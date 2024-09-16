import axios from 'axios';
// import { Link, useNavigate } from 'react-router-dom';
import { message} from 'antd';

// Set your base URL for the API
const API_BASE_URL = 'https://rsa-api-kappa.vercel.app/api/';
const apiInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add the token to headers
apiInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIfdjp7ImlkIjoiNjY0NzIwNDhlNDAyMmY5MWJkMGMyYmQxIn0sImlhdCI6MTcyNjA1NjU0NCwiZXhwIjoxNzI2MTU2NTQ0fQ.E0tk9-lAbD2DwDS9ToXxgMi3ydmVMpI9UIGPcv-G650';
  if (token) {
    config.headers['token'] = `${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor to handle responses
apiInstance.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response) {
    console.error(error.response);
    if(error.response.data.token_expired){
      localStorage.clear();
      message.error('Session Expired! Please Login Again.');
      window.location.href = '/login';
    }else{
      // return Promise.reject(error.response.data);
      console.error('GET request error:', error);
      throw error;
    }
  } else {
    message.error('Network Error. Please try again.');
    return Promise.reject(error);
  }
});
const apiService = {
  get: async (endpoint, params = {}) => {
    try {
      const response = await apiInstance.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await apiInstance.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  },

  put: async (endpoint, data) => {
    try {
      const response = await apiInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('PUT request error:', error);
      throw error;
    }
  },

  delete: async (endpoint, params = {}) => {
    try {
      const response = await apiInstance.delete(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  },
};

export default apiService;

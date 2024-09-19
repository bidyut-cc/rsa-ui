import axios from 'axios';
// import { Link, useNavigate } from 'react-router-dom';
import { message} from 'antd';

// Set your base URL for the API
// const REACT_APP_API_URL = 'http://localhost:3001/api/';
const apiInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor to add the token to headers
apiInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
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
       // Remove the token from localStorage
       localStorage.removeItem("token");
       localStorage.removeItem("user");
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
      return response;
    } catch (error) {
    //  console.error('GET request error:', error.message);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await apiInstance.post(endpoint, data);
      return response;
    } catch (error) {
     // console.error('POST request error:', error);
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

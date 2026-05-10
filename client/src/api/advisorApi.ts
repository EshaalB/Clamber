import apiClient from './apiClient';

export const advisorApi = {
  getDashboard: () => apiClient.get('/advisor/dashboard'),
};


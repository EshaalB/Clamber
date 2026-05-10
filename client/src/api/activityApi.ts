import apiClient from './apiClient';

export const activityApi = {
  getActivities: () => apiClient.get('/activities'),
};

/**
 * User API
 */
import apiClient from './apiClient';

export const userApi = {
  getProfile: () => apiClient.get('/users/profile'),

  updateProfile: (data: Record<string, unknown>) =>
    apiClient.put('/users/profile', data),

  updateSettings: (data: Record<string, unknown>) =>
    apiClient.put('/users/settings', data),

  completeOnboarding: (data: Record<string, unknown>) =>
    apiClient.post('/users/onboarding', data),

  exportData: () =>
    apiClient.get('/users/export'),

  uploadAvatar: (formData: FormData) =>
    apiClient.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  deleteAccount: () =>
    apiClient.delete('/users/account'),
};

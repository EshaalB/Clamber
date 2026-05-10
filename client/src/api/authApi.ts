/**
 * Auth API
 */
import apiClient from './apiClient';

export const authApi = {
  register: (data: { name: string; email: string; password: string; referralCode?: string }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  verifyEmail: (data: { email: string; code: string }) =>
    apiClient.post('/auth/verify-email', data),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    apiClient.post('/auth/reset-password', data),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),
};

import apiClient from './apiClient';

export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  getUsers: (search?: string) => apiClient.get(`/admin/users?search=${search || ''}`),
  updateUser: (id: string, data: any) => apiClient.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
  promoteToAdvisor: (id: string) => apiClient.post(`/admin/users/${id}/promote`),
  resetPassword: (id: string) => apiClient.post(`/admin/users/${id}/reset-password`),
  verifyUser: (id: string) => apiClient.post(`/admin/users/${id}/verify`),
  getLogs: () => apiClient.get('/admin/logs'),
  bulkVerify: (userIds: string[]) => apiClient.post('/admin/users/bulk-verify', { userIds }),
  bulkDelete: (userIds: string[]) => apiClient.post('/admin/users/bulk-delete', { userIds }),
  getSystemSettings: () => apiClient.get('/admin/settings'),
  updateSystemSettings: (data: any) => apiClient.patch('/admin/settings', data),
  getUserActivity: (id: string) => apiClient.get(`/admin/users/${id}/activity`),
};

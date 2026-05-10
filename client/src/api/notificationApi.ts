import apiClient from './apiClient';

export const notificationApi = {
  getNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/mark-all-read'),
};

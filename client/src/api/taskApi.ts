/**
 * Task API
 */
import apiClient from './apiClient';
import { withOfflineSupport } from '../utils/offlineCache';

export interface TaskData {
  title: string;
  dueDate?: string;
  status?: 'Not Started' | 'In Progress' | 'Done';
  priority?: 'High' | 'Medium' | 'Low';
  subject?: string;
}

export const taskApi = {
  getTasks: (params?: Record<string, string>) =>
    withOfflineSupport(apiClient.get('/tasks', { params }), 'tasks_list'),

  getTaskStats: () =>
    withOfflineSupport(apiClient.get('/tasks/stats'), 'tasks_stats'),

  createTask: (data: TaskData) =>
    apiClient.post('/tasks', data),

  updateTask: (id: string, data: Partial<TaskData>) =>
    apiClient.put(`/tasks/${id}`, data),

  deleteTask: (id: string) =>
    apiClient.delete(`/tasks/${id}`),
};

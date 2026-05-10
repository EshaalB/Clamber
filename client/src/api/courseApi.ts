/**
 * Course API
 */
import apiClient from './apiClient';
import { withOfflineSupport } from '../utils/offlineCache';

export const courseApi = {
  getCourses: () => withOfflineSupport(apiClient.get('/courses'), 'courses_list'),
  getGPA: () => withOfflineSupport(apiClient.get('/courses/gpa'), 'courses_gpa'),
  createCourse: (data: { name: string; credits: number; currentGrade?: number; targetGrade?: number }) =>
    apiClient.post('/courses', data),
  updateCourse: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/courses/${id}`, data),
  deleteCourse: (id: string) =>
    apiClient.delete(`/courses/${id}`),
};

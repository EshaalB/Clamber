/**
 * Analytics API
 */
import apiClient from './apiClient';
import { withOfflineSupport } from '../utils/offlineCache';

export const analyticsApi = {
  getAnalytics: (days?: number) =>
    withOfflineSupport(apiClient.get('/analytics', { params: { days } }), `analytics_${days || 7}`),

  recordAnalytics: (data: { stressLevel: number; sleepHours: number; studyHours: number; factors?: Record<string, number> }) =>
    apiClient.post('/analytics', data),

  getBurnoutScore: (days?: 7 | 30 | 90) =>
    withOfflineSupport(apiClient.get('/analytics/burnout', { params: { days } }), `burnout_${days || 7}`),
};

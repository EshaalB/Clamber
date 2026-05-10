/**
 * AI API
 */
import apiClient from './apiClient';

export const aiApi = {
  chat: (message: string, sessionId?: string) =>
    apiClient.post('/ai/chat', { message, sessionId }),

  getHistory: (sessionId?: string) =>
    apiClient.get(`/ai/history${sessionId ? `?sessionId=${sessionId}` : ''}`),

  getConversations: () =>
    apiClient.get('/ai/conversations'),

  deleteConversation: (sessionId: string) =>
    apiClient.delete(`/ai/conversations/${sessionId}`),

  getSuggestions: () =>
    apiClient.get('/ai/suggestions'),
};
